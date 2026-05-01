"""
=============================================================================
  ALUMNI SCRAPER v2 - Pakai Google Search langsung (lebih handal)
  Jalankan: python scraper/scraper_v2.py
  
  Biarkan jalan semalaman. Bisa di-Ctrl+C kapanpun, lanjut otomatis.
=============================================================================
"""
import sys, os, re, json, time, random, logging
from datetime import datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# ── Logging ────────────────────────────────────────────────────────────────────
LOG_DIR = ROOT_DIR / "scraper" / "logs"
LOG_DIR.mkdir(exist_ok=True)
log_file = LOG_DIR / f"v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

PROGRESS_FILE = ROOT_DIR / "scraper" / "progress_v2.json"
RESULT_FILE   = ROOT_DIR / "scraper" / "results_v2.jsonl"

# ── Regex ──────────────────────────────────────────────────────────────────────
RE = {
    "linkedin":  re.compile(r"linkedin\.com/in/[\w\-\.%]+", re.I),
    "instagram": re.compile(r"instagram\.com/[\w\.]+/?", re.I),
    "facebook":  re.compile(r"facebook\.com/(?:profile\.php\?id=\d+|[\w\.]+)/?", re.I),
    "tiktok":    re.compile(r"tiktok\.com/@[\w\.]+/?", re.I),
    "email":     re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.I),
}

STATUS_KW = {
    "PNS":       ["pns","asn","pegawai negeri","aparatur sipil","cpns","kementerian",
                  "dinas","pemkab","pemkot","bumn","polri","tni","kejaksaan","mahkamah"],
    "Wirausaha": ["wirausaha","wiraswasta","owner","founder","ceo","pengusaha","usaha sendiri"],
    "Swasta":    ["swasta","pt ","cv ","tbk","startup","manager","supervisor","engineer",
                  "staff","karyawan","perusahaan"],
}

WORK_KW = ["pt ","cv ","rs ","rumah sakit","universitas","sekolah","sma ","smp ",
           "bank ","kementerian","dinas ","bpk","kpk","puskesmas","klinik","hotel",
           "kantor","instansi","lembaga"]

JOB_KW  = ["manager","direktur","kepala","staff","guru","dosen","dokter","engineer",
           "konsultan","akuntan","supervisor","perawat","bidan","hakim","jaksa",
           "programmer","analis","koordinator","admin","officer","specialist"]

# Browser headers - agar tidak terdeteksi sebagai bot
HEADERS_LIST = [
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Referer": "https://www.google.com/",
    },
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://www.google.com/",
    },
]

session = requests.Session()


def get_headers():
    h = random.choice(HEADERS_LIST).copy()
    return h


def google_search(query: str, max_results: int = 8) -> list[dict]:
    """Cari di Google dan kembalikan list hasil."""
    url = f"https://www.google.com/search?q={requests.utils.quote(query)}&num={max_results}&hl=id&gl=id"
    try:
        resp = session.get(url, headers=get_headers(), timeout=15)
        if resp.status_code == 429:
            logger.warning("[!!] Google rate limit (429). Tunggu 60 detik...")
            time.sleep(60)
            return []
        if resp.status_code != 200:
            logger.warning(f"[!!] Google status {resp.status_code}")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        results = []

        # Ambil semua link dan teks dari halaman hasil pencarian
        for tag in soup.select("div.g, div[data-hveid]"):
            a = tag.find("a", href=True)
            h3 = tag.find("h3")
            snippet_tag = tag.find("div", {"data-sncf": True}) or tag.find("span", class_=re.compile("st|VwiC3b|aCOpRe"))
            if a:
                results.append({
                    "href": a["href"],
                    "title": h3.get_text() if h3 else "",
                    "body": snippet_tag.get_text() if snippet_tag else "",
                })
        return results[:max_results]

    except Exception as e:
        logger.warning(f"[!!] Google search error: {e}")
        return []


def extract_data(text: str, urls: list[str]) -> dict:
    full = text + " ".join(urls)
    found = {}

    for key, pat in RE.items():
        if key == "email":
            continue
        m = pat.search(full)
        if m:
            raw = m.group(0).rstrip("/").lower()
            # Filter URL palsu/generik
            skip_words = ["example", "support", "help", "about", "terms", "privacy", "login", "signup"]
            if not any(s in raw for s in skip_words):
                found[key] = "https://" + raw

    # Email
    em = RE["email"].search(full)
    if em:
        found["email"] = em.group(0).lower()

    # Status kerja
    t = text.lower()
    for status, kws in STATUS_KW.items():
        if any(k in t for k in kws):
            found["status_kerja"] = status
            break

    # Tempat kerja & posisi
    for line in text.split("\n"):
        ll = line.lower()
        if not found.get("tempat_kerja"):
            if any(k in ll for k in WORK_KW) and 5 < len(line) < 150:
                found["tempat_kerja"] = line.strip()[:255]
        if not found.get("posisi"):
            if any(k in ll for k in JOB_KW) and 5 < len(line) < 120:
                found["posisi"] = line.strip()[:150]

    # Sosmed instansi (bukan profil pribadi)
    for url in urls:
        if url and any(d in url for d in ["linkedin.com/company", "facebook.com/pages"]):
            found["sosmed_instansi"] = url
            break

    return found


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text("utf-8"))
    return {"done": [], "found": 0, "searched": 0}


def save_progress(prog: dict):
    PROGRESS_FILE.write_text(json.dumps(prog, ensure_ascii=False, indent=2), "utf-8")


def save_result(r: dict):
    with open(RESULT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")


def save_to_db(db, result: dict) -> bool:
    from app.models import AlumniBase, AlumniContact, AlumniCareer, StatusKerja
    nim = result["nim"]
    alumni = db.query(AlumniBase).filter(AlumniBase.nim == nim).first()
    if not alumni:
        return False

    contact_data = {k: result.get(k) for k in ["linkedin","instagram","facebook","tiktok","email"]}
    career_data  = {k: result.get(k) for k in ["tempat_kerja","alamat_kerja","posisi","sosmed_instansi"]}
    status_raw   = result.get("status_kerja")

    if any(contact_data.values()):
        from app.models import AlumniContact
        c = db.query(AlumniContact).filter(AlumniContact.nim == nim).first()
        if not c:
            c = AlumniContact(nim=nim); db.add(c)
        for k, v in contact_data.items():
            if v and not getattr(c, k, None):
                setattr(c, k, v)

    if any(career_data.values()) or status_raw:
        from app.models import AlumniCareer
        cr = db.query(AlumniCareer).filter(AlumniCareer.nim == nim).first()
        if not cr:
            cr = AlumniCareer(nim=nim); db.add(cr)
        for k, v in career_data.items():
            if v and not getattr(cr, k, None):
                setattr(cr, k, v)
        if status_raw and not cr.status_kerja:
            try: cr.status_kerja = StatusKerja(status_raw)
            except: pass

    db.commit()
    return True


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--limit",     type=int,   default=None)
    p.add_argument("--delay",     type=float, default=6.0)
    p.add_argument("--tahun-min", type=int,   default=2016)
    p.add_argument("--tahun-max", type=int,   default=2022)
    p.add_argument("--prodi",     type=str,   default=None)
    p.add_argument("--reset",     action="store_true")
    args = p.parse_args()

    print("\n" + "="*60)
    print("  [BOT v2] ALUMNI SCRAPER - Google Search Engine")
    print("="*60 + "\n")

    if args.reset:
        for f in [PROGRESS_FILE, RESULT_FILE]:
            if f.exists(): f.unlink()
        print("[OK] Progress direset.\n")

    # ── Database ──────────────────────────────────────────────────────────────
    SQLITE = ROOT_DIR / "backend" / "alumni_dev.db"
    if not SQLITE.exists():
        logger.error(f"[!!] DB tidak ditemukan: {SQLITE}")
        sys.exit(1)

    os.environ["DATABASE_URL"] = f"sqlite:///{SQLITE.as_posix()}"
    os.chdir(ROOT_DIR / "backend")

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import Base, AlumniBase

    engine = create_engine(f"sqlite:///{SQLITE.as_posix()}", connect_args={"check_same_thread": False})
    DB = sessionmaker(bind=engine)()
    Base.metadata.create_all(bind=engine)
    logger.info(f"[OK] DB: {SQLITE}")

    # ── Ambil alumni ──────────────────────────────────────────────────────────
    q = DB.query(AlumniBase)
    tahun_min = getattr(args, "tahun_min", 2016)
    tahun_max = getattr(args, "tahun_max", 2022)
    q = q.filter(AlumniBase.tahun_masuk >= tahun_min, AlumniBase.tahun_masuk <= tahun_max)
    if args.prodi:
        q = q.filter(AlumniBase.prodi.ilike(f"%{args.prodi}%"))
    # Prioritaskan yang punya nama unik (lebih dari 2 kata)
    all_alumni = q.order_by(AlumniBase.tahun_masuk.desc(), AlumniBase.id).all()

    prog      = load_progress()
    done_nims = set(prog["done"])
    to_do     = [a for a in all_alumni if a.nim not in done_nims]
    if args.limit:
        to_do = to_do[:args.limit]

    total = len(to_do)
    print(f"[*] Total alumni (filter)  : {len(all_alumni):,}")
    print(f"[v] Sudah diproses         : {len(done_nims):,}")
    print(f"[>] Akan dicari sekarang   : {total:,}")
    print(f"[t] Delay                  : {args.delay}s\n")

    if total == 0:
        print("[OK] Semua sudah diproses!")
        return

    found_count = 0
    err_count   = 0

    bar = tqdm(to_do, desc="[CARI]", unit="alumni", ascii=True,
               bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, found={postfix}]")

    for alumni in bar:
        nim  = alumni.nim
        nama = alumni.nama
        prodi_name = alumni.prodi or ""
        bar.set_postfix({"found": found_count, "err": err_count})

        try:
            # Query 1: fokus LinkedIn
            q1 = f'"{nama}" "Universitas Muhammadiyah Malang" site:linkedin.com'
            # Query 2: cari di semua sosmed + info karir
            q2 = f'"{nama}" UMM {prodi_name} linkedin OR instagram OR "tempat kerja"'

            all_text = ""
            all_urls = []

            for query in [q1, q2]:
                results = google_search(query, max_results=6)
                for r in results:
                    all_text += f"{r['title']}\n{r['body']}\n{r['href']}\n"
                    all_urls.append(r["href"])
                time.sleep(random.uniform(1.0, 2.0))

            extracted = extract_data(all_text, all_urls)
            data_found = bool(extracted)

            record = {
                "nim": nim, "nama": nama,
                "linkedin":        extracted.get("linkedin"),
                "instagram":       extracted.get("instagram"),
                "facebook":        extracted.get("facebook"),
                "tiktok":          extracted.get("tiktok"),
                "email":           extracted.get("email"),
                "tempat_kerja":    extracted.get("tempat_kerja"),
                "alamat_kerja":    None,
                "posisi":          extracted.get("posisi"),
                "status_kerja":    extracted.get("status_kerja"),
                "sosmed_instansi": extracted.get("sosmed_instansi"),
                "scraped_at":      datetime.now().isoformat(),
                "data_found":      data_found,
            }

            save_result(record)

            if data_found:
                save_to_db(DB, record)
                found_count += 1
                logger.info(f"  [OK] {nama}: {list(extracted.keys())}")

        except KeyboardInterrupt:
            print("\n[!] Dihentikan manual. Progress tersimpan.")
            break
        except Exception as e:
            err_count += 1
            logger.error(f"  [!!] {nama}: {e}")

        finally:
            prog["done"].append(nim)
            prog["found"]    = found_count
            prog["searched"] = len(prog["done"])
            save_progress(prog)

        # Delay dengan jitter agar tidak terdeteksi
        time.sleep(random.uniform(args.delay - 1, args.delay + 2))

    # ── Ringkasan ─────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("  RINGKASAN")
    print("="*60)
    print(f"  Dicari          : {len(prog['done']):,}")
    print(f"  Data ditemukan  : {found_count:,}")
    print(f"  Error           : {err_count:,}")
    pct = found_count / len(prog['done']) * 100 if prog['done'] else 0
    print(f"  Hit rate        : {pct:.1f}%")
    print(f"  Log             : {log_file}")
    print("="*60 + "\n")
    DB.close()


if __name__ == "__main__":
    main()
