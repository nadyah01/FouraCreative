# Foura Creative — versi Node.js

Dibuat dari model Django dosen (User, UserCostumer, UserAdmin, UserSellers, MediaFile,
CategoryProduct, Product), memakai **Express + EJS + Sequelize + SQLite**.

## Menjalankan
```bash
npm install
npm run seed      # membuat tabel + data contoh (aman diulang)
npm start         # buka http://localhost:3000
```
Mode pengembangan (restart otomatis): `npm run dev`

## Akun contoh (dari seed)
| Username | Password     | Peran     |
|----------|--------------|-----------|
| admin    | admin12345   | Admin     |  |
| budi     | budi12345    | Pelanggan |

## Fitur
- Publik: beranda, katalog (filter kategori), detail produk + galeri gambar
- Daftar / masuk / keluar, edit profil (alamat, no. HP), ubah password
- Penjual & admin: tambah / ubah / hapus produk, upload gambar utama + gambar tambahan
- Admin: kelola kategori, kelola pengguna (ubah peran)

## Struktur
```
server.js              titik masuk
src/db.js              koneksi SQLite
src/models/index.js    model (setara models.py)
src/routes/            public, auth, profil, kelola
src/services/          roles, upload file, hapus produk
src/middleware/        sesi/peran, pengecekan akses
src/views/             template EJS
public/                CSS + folder uploads
src/seed.js            data awal
```

## Sebelum dipakai sungguhan (produksi)
- Isi variabel lingkungan `SESSION_SECRET` dengan teks acak yang panjang
- Tambahkan proteksi CSRF dan pembatasan percobaan login
- Pakai penyimpanan sesi permanen (bawaan hanya memori)
