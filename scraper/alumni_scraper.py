"""
=============================================================================
  ALUMNI TRACKER - BOT PENCARIAN OTOMATIS
  Universitas Muhammadiyah Malang
=============================================================================

  Cara pakai:
    python scraper/alumni_scraper.py

  Opsi:
    --limit N      Hanya cari N alumni (default: semua)
    --delay N      Jeda antar pencarian dalam detik (default: 2.5)
    --skip N       Lewati N alumni pertama (untuk resume)
    --prodi NAMA   Filter berdasarkan program studi
    --reset        Reset semua progress (mulai dari awal)

  Contoh:
    python scraper/alumni_scraper.py --limit 100
    python scraper/alumni_scraper.py --skip 500 --limit 200
    python scraper/alumni_scraper.py --prodi "Teknik Informatika"
=============================================================================
"""

import sys
import os
import re
import json
import time
import random
import argparse
import logging
from datetime import datetime
from pathlib import Path

# ── Pastikan bisa import dari backend ──────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))

from duckduckgo_search import DDGS
from tqdm import tqdm
from sqlalchemy.orm import Session

# ── Setup Logging ──────────────────────────────────────────────────────────────
LOG_DIR = ROOT_DIR / "scraper" / "logs"
LOG_DIR.mkdir(exist_ok=True)

log_file = LOG_DIR / f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# ── File progress (agar bisa resume) ──────────────────────────────────────────
PROGRESS_FILE = ROOT_DIR / "scraper" / "progress.json"
RESULT_FILE   = ROOT_DIR / "scraper" / "results.jsonl"


# =============================================================================
#  FUNGSI EKSTRAKSI URL SOSIAL MEDIA
# =============================================================================

PATTERNS = {
    "linkedin":  re.compile(r"linkedin\.com/in/[\w\-]+", re.I),
    "instagram": re.compile(r"instagram\.com/[\w\.]+", re.I),
    "facebook":  re.compile(r"facebook\.com/(?:profile\.php\?id=\d+|[\w\.]+)", re.I),
    "tiktok":    re.compile(r"tiktok\.com/@[\w\.]+", re.I),
}

EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.I
)

# Kata kunci yang sering muncul di deskripsi pekerjaan
WORK_KEYWORDS = [
    "bekerja di", "work at", "works at", "employee at",
    "staff at", "pegawai", "karyawan", "direktur", "manager",
    "kepala", "guru", "dosen", "dokter", "perawat", "engineer",
    "konsultan", "akuntan", "hakim", "jaksa", "polisi",
]

STATUS_KEYWORDS = {
    "PNS":       ["pns", "pegawai negeri", "asn", "aparatur sipil", "cpns",
                  "kementerian", "dinas", "bupati", "walikota", "pemkab", "pemkot",
                  "pemerintah kabupaten", "pemerintah kota", "mahkamah", "kejaksaan",
                  "kepolisian", "tni", "bumn", "polri"],
    "Wirausaha": ["wirausaha", "wiraswasta", "entrepreneur", "owner", "founder",
                  "co-founder", "ceo", "direktur utama", "pengusaha", "usaha"],
    "Swasta":    ["swasta", "pt ", "cv ", "tbk", "startup", "perusahaan",
                  "korporat", "manager", "supervisor", "staff"],
}


def extract_socmed(text: str) -> dict:
    """Ekstrak semua URL sosial media dari teks."""
    result = {}
    for key, pattern in PATTERNS.items():
        match = pattern.search(text)
        if match:
            url = match.group(0).lower().strip("/")
            # Normalisasi jadi URL lengkap
            result[key] = "https://" + url
    return result


def extract_email(text: str) -> str | None:
    """Ekstrak email dari teks."""
    match = EMAIL_PATTERN.search(text)
    if match:
        email = match.group(0).lower()
        # Buang email generik
        skip = ["example.com", "gmail.com" if "@gmail.com" == email[-10:] and "." not in email.split("@")[0] else ""]
        if not any(email.endswith(s) for s in skip if s):
            return email
    return None


def detect_status_kerja(text: str) -> str | None:
    """Deteksi status kerja (PNS/Wirausaha/Swasta) dari teks."""
    text_lower = text.lower()
    for status, keywords in STATUS_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return status
    return None


def extract_workplace(text: str) -> tuple[str | None, str | None, str | None]:
    """
    Ekstrak tempat kerja, posisi, dan alamat dari teks pencarian.
    Return: (tempat_kerja, posisi, alamat_kerja)
    """
    tempat_kerja = None
    posisi = None
    alamat_kerja = None

    lines = text.split("\n")
    for line in lines:
        line_lower = line.lower()

        # Cari posisi
        for kw in ["manager", "direktur", "kepala", "staff", "guru", "dosen",
                   "dokter", "engineer", "konsultan", "akuntan", "supervisor",
                   "perawat", "bidan", "hakim", "jaksa"]:
            if kw in line_lower and len(line) < 120:
                if not posisi:
                    posisi = line.strip()[:150]
                break

        # Cari tempat kerja
        for kw in ["pt ", "cv ", "rs ", "rumah sakit", "universitas",
                   "sekolah", "sma ", "smp ", "sd ", "puskesmas",
                   "bank", "kementerian", "dinas", "bpk", "kpk"]:
            if kw in line_lower and len(line) < 150:
                if not tempat_kerja:
                    tempat_kerja = line.strip()[:255]
                break

    return tempat_kerja, posisi, alamat_kerja


# =============================================================================
#  BOT PENCARIAN
# =============================================================================

class AlumniScraperBot:
    def __init__(self, delay: float = 2.5):
        self.delay = delay
        self.ddgs = DDGS()
        self.progress = self._load_progress()

    def _load_progress(self) -> dict:
        if PROGRESS_FILE.exists():
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"done_nims": [], "total_found": 0, "total_searched": 0}

    def _save_progress(self):
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(self.progress, f, ensure_ascii=False, indent=2)

    def _save_result(self, result: dict):
        with open(RESULT_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

    def search_alumni(self, nama: str, prodi: str = "", nim: str = "") -> dict:
        """
        Cari info seorang alumni via DuckDuckGo.
        Coba beberapa query berbeda untuk mendapatkan hasil terbaik.
        """
        queries = [
            f'"{nama}" UMM Universitas Muhammadiyah Malang linkedin',
            f'"{nama}" UMM {prodi} site:linkedin.com OR site:instagram.com',
            f'"{nama}" Malang "{prodi}" email kontak',
            f'"{nama}" UMM alumni pekerjaan karir',
        ]

        all_text = ""
        all_urls = []

        for query in queries[:2]:  # Gunakan 2 query per alumni
            try:
                results = self.ddgs.text(query, max_results=5)
                for r in results:
                    body = f"{r.get('title', '')} {r.get('body', '')} {r.get('href', '')}"
                    all_text += body + "\n"
                    all_urls.append(r.get("href", ""))
                time.sleep(0.5)  # Jeda kecil antar query
            except Exception as e:
                logger.warning(f"Query gagal untuk '{nama}': {e}")
                time.sleep(3)  # Tunggu lebih lama jika error

        # Gabung semua teks + URL untuk diekstrak
        full_text = all_text + " ".join(all_urls)

        # Ekstrak data
        socmed = extract_socmed(full_text)
        email  = extract_email(full_text)
        status = detect_status_kerja(full_text)
        tempat_kerja, posisi, alamat_kerja = extract_workplace(full_text)

        # Cari sosmed instansi (URL perusahaan di hasil pencarian)
        sosmed_instansi = None
        for url in all_urls:
            if url and any(domain in url for domain in ["linkedin.com/company", "instagram.com", "facebook.com"]):
                if nama.lower() not in url.lower():  # Bukan profil pribadinya
                    sosmed_instansi = url
                    break

        result = {
            "nim":             nim,
            "nama":            nama,
            "linkedin":        socmed.get("linkedin"),
            "instagram":       socmed.get("instagram"),
            "facebook":        socmed.get("facebook"),
            "tiktok":          socmed.get("tiktok"),
            "email":           email,
            "tempat_kerja":    tempat_kerja,
            "alamat_kerja":    alamat_kerja,
            "posisi":          posisi,
            "status_kerja":    status,
            "sosmed_instansi": sosmed_instansi,
            "scraped_at":      datetime.now().isoformat(),
            "data_found":      bool(socmed or email or tempat_kerja or posisi),
        }
        return result

    def save_to_db(self, db: Session, result: dict):
        """Simpan hasil pencarian ke database SQLite."""
        from app.models import AlumniBase, AlumniContact, AlumniCareer, StatusKerja

        nim = result["nim"]

        # Cek alumni ada di DB
        alumni = db.query(AlumniBase).filter(AlumniBase.nim == nim).first()
        if not alumni:
            logger.warning(f"  [SKIP] NIM {nim} tidak ditemukan di database, skip.")
            return False

        # ── Update/buat AlumniContact ────────────────────────────────────────
        contact_fields = {
            "linkedin":  result.get("linkedin"),
            "instagram": result.get("instagram"),
            "facebook":  result.get("facebook"),
            "tiktok":    result.get("tiktok"),
            "email":     result.get("email"),
        }
        if any(contact_fields.values()):
            contact = db.query(AlumniContact).filter(AlumniContact.nim == nim).first()
            if not contact:
                contact = AlumniContact(nim=nim)
                db.add(contact)
            for field, value in contact_fields.items():
                if value and not getattr(contact, field):  # Jangan timpa yang sudah ada
                    setattr(contact, field, value)

        # ── Update/buat AlumniCareer ─────────────────────────────────────────
        career_fields = {
            "tempat_kerja":    result.get("tempat_kerja"),
            "alamat_kerja":    result.get("alamat_kerja"),
            "posisi":          result.get("posisi"),
            "sosmed_instansi": result.get("sosmed_instansi"),
        }
        status_raw = result.get("status_kerja")
        if any(career_fields.values()) or status_raw:
            career = db.query(AlumniCareer).filter(AlumniCareer.nim == nim).first()
            if not career:
                career = AlumniCareer(nim=nim)
                db.add(career)
            for field, value in career_fields.items():
                if value and not getattr(career, field):
                    setattr(career, field, value)
            if status_raw and not career.status_kerja:
                try:
                    career.status_kerja = StatusKerja(status_raw)
                except ValueError:
                    pass

        db.commit()
        return True


# =============================================================================
#  MAIN
# =============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="Bot Pencarian Otomatis Data Alumni UMM",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--limit",     type=int,   default=None,  help="Batas jumlah alumni yang dicari")
    parser.add_argument("--delay",     type=float, default=2.5,   help="Jeda antar pencarian (detik)")
    parser.add_argument("--skip",      type=int,   default=0,     help="Lewati N alumni pertama")
    parser.add_argument("--prodi",     type=str,   default=None,  help="Filter berdasarkan prodi")
    parser.add_argument("--tahun-min", type=int,   default=2010,  help="Tahun masuk minimum (default: 2010)")
    parser.add_argument("--tahun-max", type=int,   default=2024,  help="Tahun masuk maksimum (default: 2024)")
    parser.add_argument("--reset",     action="store_true",       help="Reset progress & mulai dari awal")
    return parser.parse_args()


def main():
    args = parse_args()

    sys.stdout.reconfigure(encoding='utf-8', errors='replace') if hasattr(sys.stdout, 'reconfigure') else None
    print("\n" + "="*65)
    print("  [BOT] ALUMNI TRACKER - BOT PENCARIAN OTOMATIS")
    print("        Universitas Muhammadiyah Malang")
    print("="*65 + "\n")

    # ── Reset progress jika diminta ───────────────────────────────────────────
    if args.reset:
        if PROGRESS_FILE.exists():
            PROGRESS_FILE.unlink()
        if RESULT_FILE.exists():
            RESULT_FILE.unlink()
        print("[OK] Progress direset.\n")

    # ── Setup database (SELALU pakai SQLite lokal) ─────────────────────────────
    SQLITE_PATH = ROOT_DIR / "backend" / "alumni_dev.db"
    os.chdir(ROOT_DIR / "backend")

    if not SQLITE_PATH.exists():
        logger.error(f"[!!] File database tidak ditemukan: {SQLITE_PATH}")
        logger.error("    Jalankan backend server dulu (run_dev.bat) agar DB terbuat dan data diimport.")
        sys.exit(1)

    # Override env var SEBELUM import app agar tidak konek ke Supabase
    db_url = f"sqlite:///{SQLITE_PATH.as_posix()}"
    os.environ["DATABASE_URL"] = db_url

    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        engine_local = create_engine(db_url, connect_args={"check_same_thread": False})
        SessionLocalBot = sessionmaker(autocommit=False, autoflush=False, bind=engine_local)

        # Import models setelah env di-override
        from app.models import Base, AlumniBase, AlumniContact, AlumniCareer
        Base.metadata.create_all(bind=engine_local)

        db = SessionLocalBot()
        logger.info(f"[OK] Koneksi ke SQLite lokal berhasil: {SQLITE_PATH}")
    except Exception as e:
        logger.error(f"[!!] Gagal koneksi ke database: {e}")
        sys.exit(1)

    # ── Ambil daftar alumni dari database ─────────────────────────────────────
    query = db.query(AlumniBase)
    if args.prodi:
        query = query.filter(AlumniBase.prodi.ilike(f"%{args.prodi}%"))
    
    # Filter tahun masuk - fokus ke angkatan muda yang ada di sosmed
    tahun_min = getattr(args, 'tahun_min', 2010)
    tahun_max = getattr(args, 'tahun_max', 2024)
    if tahun_min:
        query = query.filter(AlumniBase.tahun_masuk >= tahun_min)
    if tahun_max:
        query = query.filter(AlumniBase.tahun_masuk <= tahun_max)

    all_alumni = query.order_by(AlumniBase.tahun_masuk.desc(), AlumniBase.id).all()

    if not all_alumni:
        logger.error("[!!] Tidak ada alumni di database! Import data Excel dulu.")
        sys.exit(1)

    # ── Filter: skip yang sudah diproses ──────────────────────────────────────
    bot = AlumniScraperBot(delay=args.delay)
    done_nims = set(bot.progress.get("done_nims", []))

    alumni_to_process = [
        a for a in all_alumni
        if a.nim not in done_nims
    ]

    # Apply --skip dan --limit
    if args.skip:
        alumni_to_process = alumni_to_process[args.skip:]
    if args.limit:
        alumni_to_process = alumni_to_process[:args.limit]

    total = len(alumni_to_process)
    already_done = len(done_nims)

    print(f"[*]  Total alumni di DB    : {len(all_alumni):,}")
    print(f"[v]  Sudah diproses        : {already_done:,}")
    print(f"[>]  Akan dicari sekarang  : {total:,}")
    print(f"[t]  Jeda antar pencarian  : {args.delay}s")
    if args.prodi:
        print(f"[~]  Filter prodi          : {args.prodi}")
    print()

    if total == 0:
        print("[OK] Semua alumni sudah diproses! Jalankan dengan --reset untuk mengulang.")
        return

    # ── Mulai pencarian ────────────────────────────────────────────────────────
    found_count  = 0
    error_count  = 0
    saved_count  = 0

    pbar = tqdm(alumni_to_process, desc="[CARI]", unit="alumni",
                bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]",
                ascii=True)

    for alumni in pbar:
        nim  = alumni.nim
        nama = alumni.nama
        prodi_nama = alumni.prodi or ""

        pbar.set_postfix({
            "nama": nama[:20] + "..." if len(nama) > 20 else nama,
            "ditemukan": found_count,
            "error": error_count,
        })

        try:
            result = bot.search_alumni(nama=nama, prodi=prodi_nama, nim=nim)

            # Simpan ke file JSONL (backup)
            bot._save_result(result)

            # Simpan ke database
            if result["data_found"]:
                saved = bot.save_to_db(db, result)
                if saved:
                    found_count += 1
                    saved_count += 1
                    logger.info(f"  [OK] [{nim}] {nama} -> ditemukan data")
            else:
                logger.debug(f"  [--] [{nim}] {nama} -> tidak ditemukan")

        except Exception as e:
            error_count += 1
            logger.error(f"  [!!] [{nim}] {nama} -> ERROR: {e}")

        finally:
            # Tandai sudah diproses
            bot.progress["done_nims"].append(nim)
            bot.progress["total_searched"] = already_done + pbar.n
            bot.progress["total_found"] = found_count
            bot._save_progress()

        # Jeda agar tidak kena rate limit
        jitter = random.uniform(-0.5, 0.5)
        time.sleep(max(1.0, args.delay + jitter))

    # ── Ringkasan ─────────────────────────────────────────────────────────────
    print("\n" + "="*65)
    print("  RINGKASAN HASIL PENCARIAN")
    print("="*65)
    print(f"  Total alumni dicari    : {total:,}")
    print(f"  Data berhasil ditemukan: {found_count:,}")
    print(f"  Tidak ditemukan        : {total - found_count - error_count:,}")
    print(f"  Error                  : {error_count:,}")
    print(f"  Coverage saat ini      : {(already_done + found_count) / len(all_alumni) * 100:.1f}%")
    print(f"\n  [LOG] Log tersimpan di  : {log_file}")
    print(f"  [JSON] Hasil (JSONL)    : {RESULT_FILE}")
    print("="*65 + "\n")

    db.close()


if __name__ == "__main__":
    main()
