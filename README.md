# Alumni Tracker System - UMM

Sistem pelacakan alumni Universitas Muhammadiyah Malang yang dirancang untuk mengelola data karir dan kontak lulusan secara efisien. Sistem ini memiliki antarmuka premium berbasis **Royal Blue** dan mendukung pencarian publik serta manajemen data administratif.

## 🚀 Fitur Utama
- **Public Search Bar**: Pencarian alumni berdasarkan Nama, NIM, Prodi, dan Fakultas tanpa perlu login.
- **Admin Dashboard**: Statistik lengkap sebaran alumni per tahun dan per fakultas.
- **Manajemen Data**: Admin dapat mengedit data kontak (LinkedIn, IG, Email, dll) dan data karir (Posisi, Status Kerja, dll).
- **Export Data**: Fitur untuk mengekspor data alumni ke format Excel/CSV.
- **Audit Log**: Mencatat setiap aktivitas perubahan data untuk keamanan.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React.js (Vite), TailwindCSS, Lucide Icons, Recharts.
- **Backend**: FastAPI (Python), SQLAlchemy, JWT Authentication.
- **Database**: SQLite (Ringan dan portabel).

## 🔑 Detail Akun Login (Untuk Dosen/Penguji)
Gunakan akun berikut untuk masuk ke dashboard admin:
- **Username**: `admin`
- **Password**: `admin123`

---

## 🏃 Cara Menjalankan Project

### 1. Prasyarat
- Pastikan sudah menginstal **Node.js** (v16 atau lebih baru).
- Pastikan sudah menginstal **Python** (3.8 atau lebih baru).

### 2. Persiapan Backend
Buka terminal baru di folder `backend/`:
```bash
# Masuk ke folder backend
cd backend

# Buat virtual environment (opsional tapi disarankan)
python -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate

# Instal dependencies
pip install -r requirements.txt

# Jalankan server
uvicorn app.main:app --reload
```
Server backend akan berjalan di: `http://localhost:8000`

### 3. Persiapan Frontend
Buka terminal baru di folder root project:
```bash
# Instal dependencies
npm install

# Jalankan aplikasi (Dev Mode)
npm run dev
```
Aplikasi frontend akan berjalan di: `http://localhost:5173`

---

## 📂 Struktur Data Alumni
Sesuai dengan instruksi tugas, sistem ini mencatat variabel berikut:
1. Alamat Sosial Media (LinkedIn, IG, FB, Tiktok)
2. Email
3. No Hp
4. Tempat Bekerja
5. Alamat Bekerja
6. Posisi
7. Status (PNS, Swasta, Wirausaha)
8. Sosmed Tempat Bekerja

---
**Catatan Keamanan**: 
Semua data adalah untuk kepentingan pembelajaran, dilarang menyebarkan untuk kepentingan apapun. Sistem dilindungi oleh sistem autentikasi JWT (JSON Web Token).

---
© 2024 Alumni Tracker UMM
