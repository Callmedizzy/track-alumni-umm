"""
Script untuk melihat progress dan statistik coverage bot pencarian.
Jalankan: python scraper/lihat_progress.py
"""

import sys
import os
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))

os.chdir(ROOT_DIR / "backend")

from app.database import SessionLocal, engine
from app.models import Base, AlumniBase, AlumniContact, AlumniCareer
from sqlalchemy import func

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("\n" + "="*65)
print("  📊  STATISTIK COVERAGE DATA ALUMNI UMM")
print("="*65)

# ── Statistik dari database ────────────────────────────────────────────────────
total = db.query(func.count(AlumniBase.id)).scalar() or 0

# Hitung per field
stats = {
    "LinkedIn":        db.query(func.count(AlumniContact.id)).filter(AlumniContact.linkedin    != None).scalar() or 0,
    "Instagram":       db.query(func.count(AlumniContact.id)).filter(AlumniContact.instagram   != None).scalar() or 0,
    "Facebook":        db.query(func.count(AlumniContact.id)).filter(AlumniContact.facebook    != None).scalar() or 0,
    "TikTok":          db.query(func.count(AlumniContact.id)).filter(AlumniContact.tiktok      != None).scalar() or 0,
    "Email":           db.query(func.count(AlumniContact.id)).filter(AlumniContact.email       != None).scalar() or 0,
    "No. HP":          db.query(func.count(AlumniContact.id)).filter(AlumniContact.no_hp       != None).scalar() or 0,
    "Tempat Kerja":    db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.tempat_kerja  != None).scalar() or 0,
    "Alamat Kerja":    db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.alamat_kerja  != None).scalar() or 0,
    "Posisi":          db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.posisi        != None).scalar() or 0,
    "Status Kerja":    db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja  != None).scalar() or 0,
    "Sosmed Instansi": db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.sosmed_instansi != None).scalar() or 0,
}

total_fields_filled = sum(stats.values())
max_possible        = total * 8  # 8 field yang dinilai dosen

print(f"\n  Total alumni di database  : {total:,}")
print(f"\n  {'Field':<22} {'Ditemukan':>12} {'Coverage':>10}")
print(f"  {'-'*22} {'-'*12} {'-'*10}")
for field, count in stats.items():
    pct = (count / total * 100) if total > 0 else 0
    bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
    print(f"  {field:<22} {count:>12,}   {pct:>6.1f}%  {bar}")

print(f"\n  {'─'*55}")
total_found    = sum(stats.values())
coverage_score = total_found / max_possible * 100 if max_possible > 0 else 0

print(f"  Total field terisi (semua) : {total_found:,} dari {max_possible:,}")
print(f"  Coverage Score (estimasi)  : {coverage_score:.1f}%")

# ── Nilai Coverage dari rubrik dosen ──────────────────────────────────────────
# Dosen menilai berapa ALUMNI yang datanya ditemukan (bukan per field)
alumni_dengan_kontak = db.query(func.count(AlumniContact.id)).scalar() or 0
alumni_dengan_karir  = db.query(func.count(AlumniCareer.id)).scalar() or 0
alumni_tracked       = max(alumni_dengan_kontak, alumni_dengan_karir)

print(f"\n  ── PENILAIAN COVERAGE DOSEN ──────────────────────────────────")
print(f"  Alumni yang sudah dilacak  : {alumni_tracked:,}")

if   alumni_tracked >= 106720: skor_coverage = "91–100"
elif alumni_tracked >= 85377:  skor_coverage = "81–90"
elif alumni_tracked >= 56918:  skor_coverage = "61–80"
elif alumni_tracked >= 28459:  skor_coverage = "41–60"
else:                           skor_coverage = "0–40"

print(f"  Estimasi skor coverage     : {skor_coverage}")

# ── Progress file ──────────────────────────────────────────────────────────────
PROGRESS_FILE = ROOT_DIR / "scraper" / "progress.json"
if PROGRESS_FILE.exists():
    with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
        prog = json.load(f)
    searched = prog.get("total_searched", 0)
    found    = prog.get("total_found", 0)
    print(f"\n  ── STATUS BOT ────────────────────────────────────────────────")
    print(f"  Total sudah dicari (bot)   : {searched:,}")
    print(f"  Berhasil ditemukan (bot)   : {found:,}")
    print(f"  Sisa yang belum dicari     : {total - searched:,}")
    if searched > 0:
        est_minutes = (total - searched) * 2.5 / 60
        print(f"  Estimasi waktu selesai     : {est_minutes:,.0f} menit ({est_minutes/60:.1f} jam)")
else:
    print(f"\n  ℹ️   Bot belum pernah dijalankan.")

print("\n" + "="*65 + "\n")
db.close()
