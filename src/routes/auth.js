const router = require('express').Router();
const { sequelize, User, UserCostumer } = require('../models');

const amanNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/');
const regenerate = (req) => new Promise((ok, no) => req.session.regenerate((e) => (e ? no(e) : ok())));

router.get('/daftar', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('daftar', { title: 'Daftar', error: null, form: {} });
});

router.post('/daftar', async (req, res, next) => {
  try {
    const f = {
      username: (req.body.username || '').trim(),
      first_name: (req.body.first_name || '').trim(),
      email: (req.body.email || '').trim(),
      no_hp: (req.body.no_hp || '').trim(),
      alamat: (req.body.alamat || '').trim(),
      nama_umkm: (req.body.nama_umkm || '').trim(),
    };
    const { password, password2 } = req.body;
    let error = null;
    if (!/^[A-Za-z0-9_.]{3,30}$/.test(f.username)) error = 'Username 3–30 karakter: huruf, angka, titik, atau underscore.';
    else if (!f.first_name) error = 'Nama wajib diisi.';
    else if (!password || password.length < 8) error = 'Password minimal 8 karakter.';
    else if (password !== password2) error = 'Konfirmasi password tidak sama.';
    else if (f.no_hp && !/^[0-9+\-\s]{8,20}$/.test(f.no_hp)) error = 'Nomor HP tidak valid.';
    else if (await User.findOne({ where: { username: f.username } })) error = 'Username sudah dipakai.';
    if (error) return res.status(400).render('daftar', { title: 'Daftar', error, form: f });

    const user = await sequelize.transaction(async (t) => {
      const u = await User.create({ username: f.username, password, first_name: f.first_name, email: f.email }, { transaction: t });
      await UserCostumer.create({ user_id: u.id, alamat: f.alamat || null, no_hp: f.no_hp || null, nama_umkm: f.nama_umkm || null }, { transaction: t });
      return u;
    });
    await regenerate(req);
    req.session.userId = user.id;
    req.flash('ok', `Selamat datang, ${user.first_name}! Akun berhasil dibuat.`);
    res.redirect('/');
  } catch (e) { next(e); }
});

router.get('/masuk', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('masuk', { title: 'Masuk', error: null, next: amanNext(req.query.next), username: '' });
});

router.post('/masuk', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const tujuan = amanNext(req.body.next);
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.checkPassword(req.body.password || ''))) {
      return res.status(401).render('masuk', { title: 'Masuk', error: 'Username atau password salah.', next: tujuan, username });
    }
    await regenerate(req);
    req.session.userId = user.id;
    req.flash('ok', `Halo lagi, ${user.first_name || user.username}!`);
    res.redirect(tujuan);
  } catch (e) { next(e); }
});

router.post('/keluar', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
