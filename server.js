const express = require('express');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'foura-dev-secret-ganti-di-produksi',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 },
}));
app.use(require('./src/middleware/locals'));

app.use('/', require('./src/routes/public'));
app.use('/', require('./src/routes/auth'));
app.use('/profil', require('./src/routes/profil'));
app.use('/pembayaran', require('./src/routes/pembayaran'));
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
