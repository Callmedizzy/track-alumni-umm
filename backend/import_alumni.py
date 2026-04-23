#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
import_alumni.py
Script untuk mengimpor file Excel alumni ke database.

Penggunaan:
    python import_alumni.py --file "Alumni 2000-2025.xlsx" --sheet "Sheet1"

Opsi:
    --file          Path ke file Excel (default: Alumni 2000-2025.xlsx)
    --sheet         Nama sheet (default: Sheet1)
    --dry-run       Hanya preview tanpa simpan ke DB
    --create-users  Buat user admin & viewer default setelah import
"""

import argparse
import os
import secrets
import string
import sys
from datetime import date, datetime

# Load .env file jika ada
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import bcrypt
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ─── Setup ───────────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./alumni_dev.db"
)

IS_SQLITE = DATABASE_URL.startswith("sqlite")


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

FAKULTAS_MAP = {
    "fkip": "Fakultas Keguruan dan Ilmu Pendidikan",
    "fk": "Fakultas Kedokteran",
    "ft": "Fakultas Teknik",
    "feb": "Fakultas Ekonomi dan Bisnis",
    "fisip": "Fakultas Ilmu Sosial dan Ilmu Politik",
    "fh": "Fakultas Hukum",
    "fpp": "Fakultas Pertanian dan Peternakan",
    "fpsi": "Fakultas Psikologi",
    "fik": "Fakultas Ilmu Kesehatan",
    "fai": "Fakultas Agama Islam",
}


def normalize_fakultas(val):
    if not val or not isinstance(val, str):
        return val
    val = val.strip()
    lower = val.lower()
    for abbr, full in FAKULTAS_MAP.items():
        if lower == abbr or lower == full.lower():
            return full
    return val.title()


def parse_date(val):
    if val is None or val == "":
        return None
    try:
        if pd.isna(val):
            return None
    except Exception:
        pass
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(val.strip(), fmt).date()
            except ValueError:
                continue
    return None


def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_engine():
    if IS_SQLITE:
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    return create_engine(DATABASE_URL, pool_pre_ping=True)


# ─── Create tables (SQLite compatible) ───────────────────────────────────────

ALUMNI_TABLE_SQLITE = """
    CREATE TABLE IF NOT EXISTS alumni_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama VARCHAR(255) NOT NULL,
        nim VARCHAR(50) UNIQUE NOT NULL,
        tahun_masuk INTEGER,
        tgl_lulus DATE,
        fakultas VARCHAR(150),
        prodi VARCHAR(150),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
"""

ALUMNI_TABLE_PG = """
    CREATE TABLE IF NOT EXISTS alumni_base (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        nim VARCHAR(50) UNIQUE NOT NULL,
        tahun_masuk INTEGER,
        tgl_lulus DATE,
        fakultas VARCHAR(150),
        prodi VARCHAR(150),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
"""

USERS_TABLE_SQLITE = """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
"""

USERS_TABLE_PG = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'viewer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
"""


# ─── Main import logic ────────────────────────────────────────────────────────

def run_import(file_path, sheet_name, dry_run=False):
    print()
    print("=" * 60)
    print("  IMPORT ALUMNI - {}".format("DRY RUN" if dry_run else "LIVE"))
    print("  File : {}".format(file_path))
    print("  Sheet: {}".format(sheet_name))
    print("=" * 60)
    print()

    print("Membaca file Excel...")
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name, dtype=str)
    except FileNotFoundError:
        print("ERROR: File tidak ditemukan: {}".format(file_path))
        sys.exit(1)
    except Exception as e:
        print("ERROR: Gagal membaca Excel: {}".format(e))
        sys.exit(1)

    print("   -> {} baris ditemukan, {} kolom".format(len(df), len(df.columns)))
    print("   -> Kolom: {}\n".format(list(df.columns)))

    col_map = {
        "Nama Lulusan": "nama",
        "NIM": "nim",
        "Tahun Masuk": "tahun_masuk",
        "Tanggal Lulus": "tgl_lulus",
        "Fakultas": "fakultas",
        "Program Studi": "prodi",
    }

    missing_cols = [c for c in col_map if c not in df.columns]
    if missing_cols:
        print("ERROR: Kolom tidak ditemukan di Excel: {}".format(missing_cols))
        print("   Kolom yang ada: {}".format(list(df.columns)))
        sys.exit(1)

    df = df.rename(columns=col_map)
    df = df[list(col_map.values())]

    print("Membersihkan data...")
    df["nama"] = df["nama"].str.strip().str.title()
    df["nim"] = df["nim"].str.strip()
    df["fakultas"] = df["fakultas"].apply(normalize_fakultas)
    df["prodi"] = df["prodi"].str.strip().str.title()
    df["tahun_masuk"] = pd.to_numeric(df["tahun_masuk"], errors="coerce")
    df["tgl_lulus"] = df["tgl_lulus"].apply(parse_date)

    before = len(df)
    df = df[df["nim"].notna() & (df["nim"] != "")]
    print("   -> {} baris dibuang (NIM kosong)".format(before - len(df)))
    print("   -> {} baris valid\n".format(len(df)))

    if dry_run:
        print("Preview data (5 baris pertama):")
        print(df.head().to_string())
        print("\nDry run selesai. Tidak ada perubahan ke database.")
        return

    print("Menghubungkan ke database ({})...".format("SQLite" if IS_SQLITE else "PostgreSQL"))
    engine = get_engine()
    Session = sessionmaker(bind=engine)

    try:
        with Session() as session:
            session.begin()
            try:
                # Buat tabel jika belum ada
                create_sql = ALUMNI_TABLE_SQLITE if IS_SQLITE else ALUMNI_TABLE_PG
                session.execute(text(create_sql))

                # Ambil NIM yang sudah ada
                existing_nims = {
                    row[0]
                    for row in session.execute(text("SELECT nim FROM alumni_base")).fetchall()
                }
                print("   -> {} NIM sudah ada di database\n".format(len(existing_nims)))

                stats = {"total": len(df), "inserted": 0, "duplicate": 0, "error": 0}

                for idx, row in df.iterrows():
                    nim = str(row["nim"]).strip()

                    if nim in existing_nims:
                        stats["duplicate"] += 1
                        continue

                    try:
                        tgl = row["tgl_lulus"]
                        tgl_str = tgl.isoformat() if isinstance(tgl, date) else None
                        tahun = int(row["tahun_masuk"]) if pd.notna(row["tahun_masuk"]) else None

                        session.execute(
                            text("""
                                INSERT INTO alumni_base (nama, nim, tahun_masuk, tgl_lulus, fakultas, prodi)
                                VALUES (:nama, :nim, :tahun_masuk, :tgl_lulus, :fakultas, :prodi)
                            """),
                            {
                                "nama": row["nama"] or "",
                                "nim": nim,
                                "tahun_masuk": tahun,
                                "tgl_lulus": tgl_str,
                                "fakultas": row["fakultas"],
                                "prodi": row["prodi"],
                            },
                        )
                        existing_nims.add(nim)
                        stats["inserted"] += 1

                        if stats["inserted"] % 5000 == 0:
                            session.commit()
                            print("   ... {} record berhasil diinsert...".format(stats["inserted"]))

                    except Exception as e:
                        stats["error"] += 1
                        if stats["error"] <= 5:
                            print("   Baris {} (NIM={}): {}".format(idx, nim, e))

                session.commit()

            except Exception as fatal:
                session.rollback()
                print("\nERROR FATAL - Rollback: {}".format(fatal))
                sys.exit(1)

    except Exception as conn_err:
        print("ERROR koneksi database: {}".format(conn_err))
        sys.exit(1)

    print()
    print("=" * 60)
    print("  RINGKASAN IMPORT")
    print("=" * 60)
    print("  Total baris di Excel : {:,}".format(stats["total"]))
    print("  Berhasil diimport    : {:,}".format(stats["inserted"]))
    print("  Duplikat dilewati    : {:,}".format(stats["duplicate"]))
    print("  Error                : {:,}".format(stats["error"]))
    print("=" * 60)


# ─── Buat user default ────────────────────────────────────────────────────────

def create_default_users():
    print("\nMembuat user default...\n")
    engine = get_engine()
    Session = sessionmaker(bind=engine)

    admin_pass = generate_password()
    viewer_pass = generate_password()

    users = [
        {"username": "admin", "password": admin_pass, "role": "admin"},
        {"username": "viewer", "password": viewer_pass, "role": "viewer"},
    ]

    with Session() as session:
        create_sql = USERS_TABLE_SQLITE if IS_SQLITE else USERS_TABLE_PG
        session.execute(text(create_sql))

        for u in users:
            existing = session.execute(
                text("SELECT id FROM users WHERE username = :un"),
                {"un": u["username"]},
            ).fetchone()

            if existing:
                print("   User '{}' sudah ada, dilewati.".format(u["username"]))
                # Tampilkan password lama tidak bisa, reset aja
                users = [x for x in users if x["username"] != u["username"]]
                continue

            hashed = hash_password(u["password"])
            session.execute(
                text("""
                    INSERT INTO users (username, password_hash, role)
                    VALUES (:username, :password_hash, :role)
                """),
                {"username": u["username"], "password_hash": hashed, "role": u["role"]},
            )
            session.commit()
            print("   User '{}' (role: {}) berhasil dibuat.".format(u["username"], u["role"]))

    if users:
        print()
        print("=" * 60)
        print("  KREDENSIAL LOGIN - SIMPAN SEKARANG!")
        print("=" * 60)
        for u in users:
            print("  Username : {}".format(u["username"]))
            print("  Password : {}".format(u["password"]))
            print("  Role     : {}".format(u["role"]))
            print("  " + "-" * 30)
        print("=" * 60)
        print("  Password hanya tampil SEKALI. Segera catat!\n")


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import alumni Excel ke database")
    parser.add_argument("--file", default="Alumni 2000-2025.xlsx", help="Path ke file Excel")
    parser.add_argument("--sheet", default="Sheet1", help="Nama sheet di Excel")
    parser.add_argument("--dry-run", action="store_true", help="Preview tanpa simpan ke DB")
    parser.add_argument("--create-users", action="store_true", help="Buat user admin & viewer")
    args = parser.parse_args()

    run_import(args.file, args.sheet, args.dry_run)

    if args.create_users:
        create_default_users()
