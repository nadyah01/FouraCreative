// Pengaturan halaman pembayaran. ISI DATA ASLI DI SINI sebelum dipakai.
module.exports = {
  // Nama metode yang tampil (kunci dipakai di form dan database)
  metode: { gopay: 'GoPay', qris: 'QRIS', dana: 'DANA', transfer: 'Transfer Bank' },

  // Tujuan pembayaran e-wallet
  ewallet: {
    gopay: { nomor: 'ISI-NOMOR-GOPAY', atasNama: 'ISI-NAMA-PEMILIK' },
    dana:  { nomor: 'ISI-NOMOR-DANA',  atasNama: 'ISI-NAMA-PEMILIK' },
  },
  // Gambar QRIS: taruh file-nya di public/images/qris.png
  qrisGambar: '/images/qris.png',

  // Daftar rekening untuk transfer bank (boleh lebih dari satu)
  bank: [
    { nama: 'BCA', noRek: 'ISI-NOMOR-REKENING', atasNama: 'ISI-NAMA-PEMILIK' },
  ],

  // Ukuran maksimal bukti bayar (MB)
  batasMB: 3,
};