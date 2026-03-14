# Sistem Pelacakan Alumni

Aplikasi web sederhana untuk mengelola data dan pelacakan alumni.

## Teknologi yang Digunakan

- HTML
- CSS
- JavaScript
- Node.js
- Express
- JSON file sebagai database

## Cara Menjalankan Aplikasi Secara Lokal

1. Install Node.js.
2. Jalankan perintah berikut di folder project:

```bash
npm install
node server.js
```

3. Buka browser di:

```
http://localhost:3000
```

## Fitur Aplikasi

- Tambah data alumni
- Cari data alumni
- Edit data alumni
- Hapus data alumni
- Menampilkan daftar alumni

## Tabel Pengujian Aplikasi

| No | Fitur         | Skenario Pengujian              | Hasil    |
| -- | ------------- | ------------------------------- | -------- |
| 1  | Tambah Alumni | Menambahkan data alumni baru    | Berhasil |
| 2  | Cari Alumni   | Mencari alumni berdasarkan nama | Berhasil |
| 3  | Edit Alumni   | Memperbarui data alumni         | Berhasil |
| 4  | Hapus Alumni  | Menghapus data alumni           | Berhasil |
| 5  | Lihat Data    | Menampilkan semua data alumni   | Berhasil |

## Pengujian Sistem

Bagian ini menjelaskan pengujian yang dilakukan untuk memastikan setiap fitur utama berjalan sesuai kebutuhan dan dapat digunakan dengan baik oleh pengguna.

| No | Fitur yang Diuji | Skenario Pengujian | Hasil yang Diharapkan | Hasil Pengujian | Status |
|----|------------------|--------------------|----------------------|-----------------|--------|
| 1 | Pencarian data tanpa login | Pengunjung mencari data alumni menggunakan kolom pencarian tanpa login | Data alumni yang sesuai tampil di tabel | Berhasil | Selesai |
| 2 | Login admin | Admin memasukkan username dan password yang benar | Sistem menampilkan status login berhasil dan akses CRUD aktif | Berhasil | Selesai |
| 3 | Tambah data (Create) | Admin menambahkan data alumni baru melalui form | Data baru tersimpan dan tampil di tabel | Berhasil | Selesai |
| 4 | Edit data (Update) | Admin mengubah data alumni yang ada | Data alumni diperbarui di tabel | Berhasil | Selesai |
| 5 | Hapus data (Delete) | Admin menghapus salah satu data alumni | Data alumni terhapus dari tabel | Berhasil | Selesai |

## Login Admin

Untuk masuk sebagai admin, gunakan kredensial berikut:

- Username: `admin`
- Password: `admin123`

Setelah login, fitur Tambah, Edit, dan Hapus data alumni akan aktif.

