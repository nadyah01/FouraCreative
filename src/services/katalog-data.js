// src/services/katalog-data.js
// Daftar harga FIX Foura Creative (+ waktu pengerjaan + gambar)
// Foto ditaruh di folder public/images/katalog/  ->  jalur di sini: '/images/katalog/nama-file.jpg'
// Kalau 'gambar' dikosongkan (''), kartu menampilkan huruf awal.

const kategori = [
  {
    id: 1,
    name_kategori: 'Paket Bundling',
    deskripsi_kategori: 'Solusi lengkap untuk mengelola media sosial bisnismu.',
    products: [
      {
        name: 'Paket Basic',
        deskripsi: 'Cocok untuk bisnis yang baru memulai.',
        price: 500000, satuan: 'bulan', tipe: 'paket', populer: false,
        waktu: 'Berjalan 1 bulan',
        gambar: '/images/paket-basic.jpg',
        fitur: ['3 konten feed Instagram/bulan', '3 konten TikTok/bulan', 'Jadwal posting rutin', 'Laporan sederhana bulanan'],
      },
      {
        name: 'Paket Pro',
        deskripsi: 'Untuk bisnis yang ingin lebih berkembang.',
        price: 1100000, satuan: 'bulan', tipe: 'paket', populer: true,
        waktu: 'Berjalan 1 bulan',
        gambar: '/images/paket-pro.jpg',
        fitur: ['12 konten (feed + video)', 'Kelola Instagram & TikTok', 'Laporan bulanan + 1x konsultasi'],
      },
      {
        name: 'Paket Premium',
        deskripsi: 'Untuk brand yang ingin hasil maksimal.',
        price: 2000000, satuan: 'bulan', tipe: 'paket', populer: false,
        waktu: 'Berjalan 1 bulan',
        gambar: '/images/paket-premium.jpg',
        fitur: ['16 konten (feed + video)', '1x sesi foto/video produk profesional', 'Bantu strategi promo musiman (Lebaran, akhir tahun)', 'Laporan detail + konsultasi 2x/bulan'],
      },
    ],
  },
  {
    id: 2,
    name_kategori: 'Konten & Foto',
    deskripsi_kategori: 'Konten visual yang menarik untuk brand fashion.',
    products: [
      { name: 'Konten Feed Instagram', deskripsi: 'Desain feed Instagram yang rapi dan sesuai karakter brand.', price: 35000, satuan: 'konten', tipe: 'jasa', catatan: 'Fleksibel, minimal 1x/minggu', waktu: '1-2 hari kerja', gambar: '/images/konten-feed-instagram.jpg' },
      { name: 'Konten Video TikTok', deskripsi: 'Video pendek untuk meningkatkan engagement.', price: 45000, satuan: 'konten', tipe: 'jasa', catatan: 'Fleksibel, minimal 1x/minggu', waktu: '2-3 hari kerja', gambar: '/images/konten-video-tiktok.jpg' },
      { name: 'Sesi Foto Produk Profesional', deskripsi: 'Foto produk berkualitas tinggi dan estetik.', price: 350000, satuan: 'sesi', tipe: 'jasa', catatan: 'Hingga 15 produk', waktu: 'Pemotretan 1 hari, hasil edit 3-5 hari kerja', gambar: '/images/sesi-foto-produk.jpg' },
      { name: 'Video Promosi Produk', deskripsi: 'Video promosi untuk menampilkan produk secara menarik.', price: 150000, satuan: 'video', tipe: 'jasa', waktu: '2-3 hari', gambar: '/images/video-promosi-produk.jpg' },
      { name: 'Desain Konten Promo Musiman', deskripsi: 'Desain promosi untuk momen spesial.', price: 200000, satuan: 'momen', tipe: 'jasa', catatan: 'Lebaran, akhir tahun, dll.', waktu: '3-5 hari kerja', gambar: '/images/promo-musiman.jpg' },
    ],
  },
  {
    id: 3,
    name_kategori: 'Manajemen Akun',
    deskripsi_kategori: 'Pengelolaan akun media sosial agar tetap aktif dan konsisten.',
    products: [
      { name: 'Kelola Instagram', deskripsi: 'Pengelolaan akun Instagram secara rutin.', price: 130000, satuan: 'minggu', tipe: 'jasa', waktu: 'Berjalan 1 minggu', gambar: '/images/kelola-instagram.jpg' },
      { name: 'Kelola TikTok', deskripsi: 'Pengelolaan akun TikTok secara rutin.', price: 130000, satuan: 'minggu', tipe: 'jasa', waktu: 'Berjalan 1 minggu', gambar: '/images/kelola-tiktok.jpg' },
      { name: 'Jadwal Posting Instagram', deskripsi: 'Penjadwalan posting Instagram agar konsisten.', price: 45000, satuan: 'minggu', tipe: 'jasa', waktu: 'Berjalan 1 minggu', gambar: '/images/jadwal-posting-instagram.jpg' },
      { name: 'Jadwal Posting TikTok', deskripsi: 'Penjadwalan posting TikTok agar konsisten.', price: 45000, satuan: 'minggu', tipe: 'jasa', waktu: 'Berjalan 1 minggu', gambar: '/images/jadwal-posting-tiktok.jpg' },
      { name: 'Setup Awal Akun', deskripsi: 'Penyiapan akun media sosial dari awal.', price: 200000, satuan: 'sekali bayar', tipe: 'jasa', catatan: 'Dibayar sekali di awal', waktu: '1-2 hari kerja', gambar: '/images/setup-awal-akun.jpg' },
      { name: 'Riset & Strategi Konten Bulanan', deskripsi: 'Riset tren dan rencana konten untuk satu bulan.', price: 150000, satuan: 'riset', tipe: 'jasa', waktu: '3-5 hari kerja', gambar: '/images/riset-strategi-konten.jpg' },
    ],
  },
  {
    id: 4,
    name_kategori: 'Laporan & Konsultasi',
    deskripsi_kategori: 'Pantau performa dan dapatkan arahan strategi dari tim kami.',
    products: [
      { name: 'Laporan Performa Sederhana', deskripsi: 'Ringkasan performa akun media sosial.', price: 75000, satuan: 'laporan', tipe: 'jasa', waktu: '1-2 hari kerja', gambar: '/images/laporan-sederhana.jpg' },
      { name: 'Laporan Performa Detail', deskripsi: 'Analisis performa akun yang lebih mendalam.', price: 175000, satuan: 'laporan', tipe: 'jasa', waktu: '3-4 hari kerja', gambar: '/images/laporan-detail.jpg' },
      { name: 'Sesi Konsultasi Strategi', deskripsi: 'Diskusi strategi konten bersama tim kami.', price: 100000, satuan: 'sesi', tipe: 'jasa', waktu: 'Dijadwalkan sesuai kesepakatan', gambar: '/images/konsultasi-strategi.jpg' },
      { name: 'Paket Konsultasi Rutin', deskripsi: 'Konsultasi berkala untuk menjaga arah strategi.', price: 180000, satuan: 'bulan', tipe: 'jasa', catatan: '2 sesi/bulan', waktu: '2 sesi dalam 1 bulan', gambar: '/images/konsultasi-rutin.jpg' },
    ],
  },
];

module.exports = { kategori };

