const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { requireLogin } = require('../middleware/auth');
const { getProfile } = require('../services/roles');

router.use(requireLogin);

// ---- Upload foto profil: disimpan di public/uploads/profil ----
const folderUpload = path.join(__dirname, '..', '..', 'public', 'uploads', 'profil');
fs.mkdirSync(folderUpload, { recursive: true });
const EKSTENSI = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: folderUpload,
    filename: (req, file, cb) => cb(null, `u${req.user.id}-${Date.now()}${EKSTENSI[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // maksimal 2 MB
  fileFilter: (req, file, cb) => {
    const ok = Boolean(EKSTENSI[file.mimetype]);
    if (!ok) req.fotoDitolak = true;
    cb(null, ok);
  },
});

const terimaFoto = (req, res, next) => upload.single('foto')(req, res, async (err) => {
  if (!err) return next();
  try {
    const profil = await getProfile(req.user, req.role);
    const pesan = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto maksimal 2 MB.' : 'Foto gagal diunggah.';
    res.status(400).render('profil', { title: 'Profil Saya', profil, error: pesan });
  } catch (e) { next(e); }
});

const hapusFile = (rel) => { if (rel) fs.unlink(path.join(__dirname, '..', '..', 'public', rel), () => {}); };

// ---- Halaman profil ----
router.get('/', async (req, res, next) => {
  try {
    const profil = await getProfile(req.user, req.role);
    res.render('profil', { title: 'Profil Saya', profil, error: null });
  } catch (e) { next(e); }
});

router.post('/', terimaFoto, async (req, res, next) => {
  try {
    const profil = await getProfile(req.user, req.role);
    const gagal = (pesan) => {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).render('profil', { title: 'Profil Saya', profil, error: pesan });
    };
    const no_hp = (req.body.no_hp || '').trim();
    const first_name = (req.body.first_name || '').trim();
    if (req.fotoDitolak) return gagal('Foto harus berformat JPG, PNG, atau WEBP.');
    if (!first_name) return gagal('Nama wajib diisi.');
    if (no_hp && !/^[0-9+\-\s]{8,20}$/.test(no_hp)) return gagal('Nomor HP tidak valid.');

    await req.user.update({ first_name, last_name: (req.body.last_name || '').trim(), email: (req.body.email || '').trim() });

    const dataProfil = { alamat: (req.body.alamat || '').trim() || null, no_hp: no_hp || null };
    if (req.role === 'customer') dataProfil.nama_umkm = (req.body.nama_umkm || '').trim() || null;
    if (req.file) {
      hapusFile(profil.foto); // hapus foto lama
      dataProfil.foto = '/uploads/profil/' + req.file.filename;
    }
    await profil.update(dataProfil);

    req.flash('ok', 'Profil berhasil disimpan.');
    res.redirect('/profil');
  } catch (e) { next(e); }
});

router.post('/password', async (req, res, next) => {
  try {
    const { lama, baru, baru2 } = req.body;
    const profil = await getProfile(req.user, req.role);
    let error = null;
    if (!(await req.user.checkPassword(lama || ''))) error = 'Password lama salah.';
    else if (!baru || baru.length < 8) error = 'Password baru minimal 8 karakter.';
    else if (baru !== baru2) error = 'Konfirmasi password baru tidak sama.';
    if (error) return res.status(400).render('profil', { title: 'Profil Saya', profil, error });
    await req.user.update({ password: baru });
    req.flash('ok', 'Password berhasil diubah.');
    res.redirect('/profil');
  } catch (e) { next(e); }
});

module.exports = router;