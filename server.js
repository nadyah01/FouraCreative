require('dotenv').config();
if (process.env.VERCEL && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET belum diisi di Vercel.');
}
const express = require('express');
const cookieSession = require('cookie-session');
const path = require('path');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'sesi',
  keys: [process.env.SESSION_SECRET || 'foura-dev-secret-ganti-di-produksi'],
  maxAge: 7 * 24 * 3600 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: !!process.env.VERCEL,
}));
app.use(require('./src/middleware/locals'));

app.use('/', require('./src/routes/public'));
app.use('/', require('./src/routes/auth'));
app.use('/profil', require('./src/routes/profil'));
app.use('/kelola', require('./src/routes/kelola'));

app.use((req, res) => res.status(404).render('error', { title: 'Tidak ditemukan', pesan: 'Halaman yang kamu cari tidak ada.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Terjadi kesalahan', pesan: 'Maaf, ada masalah di server. Coba lagi nanti.' });
});

if (require.main === module) {
  sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Foura Creative berjalan di http://localhost:${PORT}`));
  });
}
module.exports = app;