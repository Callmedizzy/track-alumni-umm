# Alumni Tracker System — Setup & Deployment Guide

Sistem manajemen data alumni UMM dengan FastAPI backend, React frontend, dan PostgreSQL.

---

## 📁 Struktur Proyek

```
Website Alumni Tracker/
├── backend/                  ← FastAPI (Python)
│   ├── app/
│   │   ├── main.py           ← Entry point FastAPI
│   │   ├── config.py         ← Konfigurasi (env vars)
│   │   ├── database.py       ← SQLAlchemy engine
│   │   ├── models.py         ← ORM models (5 tabel)
│   │   ├── schemas.py        ← Pydantic schemas
│   │   ├── security.py       ← JWT + bcrypt + audit log
│   │   └── routers/
│   │       ├── auth.py       ← POST /auth/login
│   │       ├── alumni.py     ← GET/PUT /alumni/*
│   │       └── admin.py      ← GET /export/excel, /admin/logs
│   ├── alembic/              ← Database migrations
│   │   └── versions/001_initial_schema.py
│   ├── import_alumni.py      ← Script import Excel → DB
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                 ← React + Tailwind
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AlumniPage.jsx
│   │   │   ├── ExportPage.jsx
│   │   │   └── AuditLogPage.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── EditAlumniModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── contexts/
│   │       ├── AuthContext.jsx
│   │       └── ToastContext.jsx
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Cara Menjalankan dengan Docker (Rekomendasi)

### 1. Persiapan

```bash
# Clone / masuk ke direktori proyek
cd "Website Alumni Tracker"

# Salin file .env
cp .env.example .env

# Edit .env — ganti password dan secret key
notepad .env
```

Isi minimal di `.env`:
```env
POSTGRES_PASSWORD=passwordKuat123!
SECRET_KEY=random-string-panjang-minimal-32-karakter
```

### 2. Jalankan Docker Compose

```bash
docker compose up -d --build
```

Tunggu hingga semua service healthy (cek dengan `docker compose ps`).

### 3. Import Data Excel

```bash
# Copy file Excel ke folder backend
copy "public\Alumni 2000-2025.xlsx" backend\

# Jalankan import + buat user default
docker compose exec backend python import_alumni.py \
  --file "Alumni 2000-2025.xlsx" \
  --create-users
```

Catat password yang tampil di terminal — **hanya tampil sekali!**

### 4. Akses Aplikasi

| Service   | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000        |
| API Docs  | http://localhost:8000/docs   |

---

## 🛠️ Setup Manual (Tanpa Docker)

### A. Backend (FastAPI)

#### Prasyarat
- Python 3.11+
- PostgreSQL 15 berjalan lokal

#### Langkah

```bash
cd backend

# Buat virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Buat file .env
copy .env.example .env
# Edit DATABASE_URL sesuai PostgreSQL lokal

# Jalankan migrasi database
alembic upgrade head

# Import data Excel + buat user admin
python import_alumni.py --file "..\public\Alumni 2000-2025.xlsx" --create-users

# Jalankan backend
uvicorn app.main:app --reload --port 8000
```

### B. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Buat file .env.local
echo VITE_API_URL=http://localhost:8000 > .env.local

# Jalankan development server
npm run dev
```

Buka: http://localhost:5173

---

## 🔐 Login Pertama Kali

Setelah menjalankan `import_alumni.py --create-users`, gunakan:

| Role   | Username | Password               |
|--------|----------|------------------------|
| Admin  | admin    | (lihat output terminal)|
| Viewer | viewer   | (lihat output terminal)|

**Login URL:** http://localhost:3000/login

---

## 📡 API Endpoints

| Method | Endpoint                    | Auth  | Deskripsi                    |
|--------|-----------------------------|-------|------------------------------|
| POST   | /auth/login                 | ❌    | Login, dapat JWT token       |
| GET    | /alumni                     | ✅    | List alumni + filter + page  |
| GET    | /alumni/{nim}               | ✅    | Detail 1 alumni              |
| PUT    | /alumni/{nim}/contact       | Admin | Update data kontak           |
| PUT    | /alumni/{nim}/career        | Admin | Update data karier           |
| GET    | /alumni/stats/dashboard     | ✅    | Statistik dashboard          |
| GET    | /export/excel               | Admin | Export ke Excel (.xlsx)      |
| GET    | /admin/logs                 | Admin | Audit log                    |

### Query params GET /alumni:
- `search` — cari nama/NIM
- `fakultas` — filter fakultas
- `prodi` — filter prodi
- `tahun` — tahun lulus
- `has_contact` — true/false
- `has_career` — true/false
- `page`, `limit` — pagination

---

## 🔒 Keamanan

- **Password** di-hash dengan **bcrypt** (cost factor 12)
- **JWT** dengan expiry **8 jam**, signed dengan HS256
- **Rate limiting** per IP (via slowapi)
- **CORS** dikonfigurasi (ubah `allow_origins` untuk production)
- **Role-based**: admin (CRUD), viewer (read-only)
- **Audit log** setiap akses & perubahan data

---

## 🐳 Perintah Docker Berguna

```bash
# Lihat status service
docker compose ps

# Lihat log backend
docker compose logs backend -f

# Akses shell PostgreSQL
docker compose exec db psql -U alumni_user -d alumni_db

# Stop semua service
docker compose down

# Stop + hapus volume (HATI-HATI: hapus semua data!)
docker compose down -v

# Rebuild setelah ubah kode
docker compose up -d --build backend
```

---

## 🔄 Alembic Migrations

```bash
cd backend

# Buat migration baru (setelah ubah models.py)
alembic revision --autogenerate -m "deskripsi perubahan"

# Jalankan semua migration pending
alembic upgrade head

# Rollback 1 migration
alembic downgrade -1

# Lihat history
alembic history
```

---

## ⚙️ Environment Variables

| Variable                | Default                              | Keterangan                    |
|-------------------------|--------------------------------------|-------------------------------|
| `DATABASE_URL`          | postgresql://...@localhost:5432/... | URL koneksi PostgreSQL        |
| `SECRET_KEY`            | (wajib diubah!)                     | Secret untuk signing JWT      |
| `ACCESS_TOKEN_EXPIRE_HOURS` | 8                               | Durasi JWT (jam)              |
| `POSTGRES_DB`           | alumni_db                           | Nama database                 |
| `POSTGRES_USER`         | alumni_user                         | User PostgreSQL               |
| `POSTGRES_PASSWORD`     | (wajib diubah!)                     | Password PostgreSQL           |
| `VITE_API_URL`          | http://localhost:8000               | URL backend untuk frontend    |

---

## 📊 Script Import Excel

```bash
# Preview tanpa simpan ke DB
python import_alumni.py --file "Alumni.xlsx" --dry-run

# Import + buat user admin & viewer
python import_alumni.py --file "Alumni.xlsx" --sheet "Sheet1" --create-users

# Hanya import (user sudah ada)
python import_alumni.py --file "Alumni.xlsx"
```

**Kolom Excel yang dibutuhkan:**
- `Nama Lulusan` → nama
- `NIM` → nim (unique key, duplikat dilewati)
- `Tahun Masuk` → tahun_masuk
- `Tanggal Lulus` → tgl_lulus (format: YYYY-MM-DD / DD/MM/YYYY)
- `Fakultas` → fakultas
- `Program Studi` → prodi
