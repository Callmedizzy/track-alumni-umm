# Sistem Pelacakan Alumni

Aplikasi web sederhana untuk tugas kuliah yang bertujuan mengelola dan melacak informasi alumni berdasarkan sumber publik (LinkedIn, Google Scholar, ResearchGate, dan sumber internet lainnya). Sistem berjalan lokal di `http://localhost:3000` tanpa autentikasi.

## Fitur Utama

- Tambah data alumni
- Pencarian alumni berdasarkan nama
- Melihat daftar alumni dalam tabel
- Edit data alumni
- Hapus data alumni
- Penyimpanan data ke file `data/alumni.json`

## Struktur Project

```
alumni-tracker/
|-- public/
|   |-- index.html
|   |-- style.css
|   `-- script.js
|-- data/
|   `-- alumni.json
|-- server.js
|-- package.json
`-- README.md
```

## Instalasi

1. Buka folder project.
2. Jalankan perintah berikut:

```bash
npm install
```

## Menjalankan Server

```bash
node server.js
```

Server akan berjalan di `http://localhost:3000`.

## REST API

- `GET /alumni` -> menampilkan semua data alumni
- `POST /alumni` -> menambahkan data alumni baru
- `PUT /alumni/:id` -> memperbarui data alumni
- `GET /alumni/search?name=` -> mencari alumni berdasarkan nama
- `DELETE /alumni/:id` -> menghapus data alumni

## Tabel Pengujian Fitur

| No | Fitur         | Skenario Pengujian              | Hasil    |
| -- | ------------- | ------------------------------- | -------- |
| 1  | Tambah Alumni | Memasukkan data alumni baru     | Berhasil |
| 2  | Lihat Alumni  | Membuka daftar alumni           | Berhasil |
| 3  | Cari Alumni   | Mencari alumni berdasarkan nama | Berhasil |
| 4  | Edit Alumni   | Mengubah data alumni di tabel   | Berhasil |
| 5  | Hapus Alumni  | Menghapus data alumni di tabel  | Berhasil |

## Catatan

Aplikasi ini dibuat untuk kebutuhan tugas mahasiswa dan bukan untuk penggunaan produksi.
