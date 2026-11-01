const router = require('express').Router();
const { User, CategoryProduct, Product, MediaFile } = require('../models');
const { requireRole } = require('../middleware/auth');
const { handleUpload, relPath, removeFile, uploadedFiles } = require('../services/files');
const { hapusProduk } = require('../services/produk');
const { ROLES, getRole, setRole } = require('../services/roles');

const adminOnly = requireRole('admin');
const gambarProduk = handleUpload([{ name: 'image', maxCount: 1 }, { name: 'gambar_tambahan', maxCount: 5 }]);
const gambarKategori = handleUpload([{ name: 'image', maxCount: 1 }]);
const bersihkan = (req) => uploadedFiles(req).forEach((f) => removeFile(relPath(f)));

/* ================= Dashboard ================= */
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const [produk, kategori, pengguna] = await Promise.all([Product.count(), CategoryProduct.count(), User.count()]);
    res.render('kelola/index', { title: 'Kelola', produk, kategori, pengguna });
  } catch (e) { next(e); }
});

/* ================= Produk (admin + penjual) ================= */
router.get('/produk', adminOnly, async (req, res, next) => {
  try {
    const daftar = await Product.findAll({ include: [{ model: CategoryProduct, as: 'category' }], order: [['createdAt', 'DESC']] });
    res.render('kelola/produk-list', { title: 'Kelola Produk', daftar });
  } catch (e) { next(e); }
});

async function formProduk(res, { produk = null, form = {}, error = null, status = 200 }) {
  const kategori = await CategoryProduct.findAll({ order: [['name_kategori', 'ASC']] });
  const media = produk ? await produk.getGambar_tambahan() : [];
  res.status(status).render('kelola/produk-form', { title: produk ? 'Ubah Produk' : 'Tambah Produk', produk, form, error, kategori, media });
}

router.get('/produk/baru', adminOnly, (req, res, next) => formProduk(res, {}).catch(next));

function validasiProduk(b, kategoriAda) {
  const name = (b.name || '').trim();
  const harga = Number(String(b.price || '').replace(',', '.'));
  if (!name) return 'Nama produk wajib diisi.';
  if (name.length > 100) return 'Nama produk maksimal 100 karakter.';
  if (!Number.isFinite(harga) || harga < 0 || harga > 99999999.99) return 'Harga tidak valid.';
  if (!kategoriAda) return 'Pilih kategori yang valid.';
  return null;
}

router.post('/produk', adminOnly, gambarProduk, async (req, res, next) => {
  try {
    const b = req.body;
    const kat = await CategoryProduct.findByPk(parseInt(b.category_id, 10) || 0);
    const error = req.uploadError || validasiProduk(b, kat);
    if (error) { bersihkan(req); return formProduk(res, { form: b, error, status: 400 }); }

    const utama = (req.files.image || [])[0];
    const produk = await Product.create({
      name: b.name.trim(), deskripsi: (b.deskripsi || '').trim() || null,
      price: Number(String(b.price).replace(',', '.')), category_id: kat.id,
      image: utama ? relPath(utama) : null,
    });
    for (const f of req.files.gambar_tambahan || []) {
      const m = await MediaFile.create({ file: relPath(f) });
      await produk.addGambar_tambahan(m);
    }
    req.flash('ok', 'Produk berhasil ditambahkan.');
    res.redirect('/kelola/produk');
  } catch (e) { bersihkan(req); next(e); }
});

router.get('/produk/:id/edit', adminOnly, async (req, res, next) => {
  try {
    const produk = await Product.findByPk(req.params.id);
    if (!produk) return next();
    await formProduk(res, { produk, form: produk.toJSON() });
  } catch (e) { next(e); }
});

router.post('/produk/:id', adminOnly, gambarProduk, async (req, res, next) => {
  try {
    const produk = await Product.findByPk(req.params.id);
    if (!produk) { bersihkan(req); return next(); }
    const b = req.body;
    const kat = await CategoryProduct.findByPk(parseInt(b.category_id, 10) || 0);
    const error = req.uploadError || validasiProduk(b, kat);
    if (error) { bersihkan(req); return formProduk(res, { produk, form: b, error, status: 400 }); }

    const data = {
      name: b.name.trim(), deskripsi: (b.deskripsi || '').trim() || null,
      price: Number(String(b.price).replace(',', '.')), category_id: kat.id,
    };
    const utama = (req.files.image || [])[0];
    if (utama) { removeFile(produk.image); data.image = relPath(utama); }
    await produk.update(data);
    for (const f of req.files.gambar_tambahan || []) {
      const m = await MediaFile.create({ file: relPath(f) });
      await produk.addGambar_tambahan(m);
    }
    req.flash('ok', 'Produk berhasil diperbarui.');
    res.redirect('/kelola/produk');
  } catch (e) { bersihkan(req); next(e); }
});

router.post('/produk/:id/media/:mediaId/hapus', adminOnly, async (req, res, next) => {
  try {
    const produk = await Product.findByPk(req.params.id);
    if (!produk) return next();
    const [m] = await produk.getGambar_tambahan({ where: { id: req.params.mediaId } });
    if (m) { removeFile(m.file); await produk.removeGambar_tambahan(m); await m.destroy(); }
    req.flash('ok', 'Gambar dihapus.');
    res.redirect(`/kelola/produk/${produk.id}/edit`);
  } catch (e) { next(e); }
});

router.post('/produk/:id/hapus', adminOnly, async (req, res, next) => {
  try {
    const produk = await Product.findByPk(req.params.id);
    if (!produk) return next();
    await hapusProduk(produk);
    req.flash('ok', 'Produk dihapus.');
    res.redirect('/kelola/produk');
  } catch (e) { next(e); }
});

/* ================= Kategori (admin) ================= */
router.get('/kategori', adminOnly, async (req, res, next) => {
  try {
    const daftar = await CategoryProduct.findAll({ include: [{ model: Product, as: 'products', attributes: ['id'] }], order: [['name_kategori', 'ASC']] });
    res.render('kelola/kategori-list', { title: 'Kelola Kategori', daftar });
  } catch (e) { next(e); }
});

router.get('/kategori/baru', adminOnly, (req, res) =>
  res.render('kelola/kategori-form', { title: 'Tambah Kategori', kat: null, form: {}, error: null }));

router.post('/kategori', adminOnly, gambarKategori, async (req, res, next) => {
  try {
    const b = req.body;
    const nama = (b.name_kategori || '').trim();
    const error = req.uploadError || (!nama ? 'Nama kategori wajib diisi.' : nama.length > 100 ? 'Nama maksimal 100 karakter.' : null);
    if (error) { bersihkan(req); return res.status(400).render('kelola/kategori-form', { title: 'Tambah Kategori', kat: null, form: b, error }); }
    const f = (req.files.image || [])[0];
    await CategoryProduct.create({ name_kategori: nama, deskripsi_kategori: (b.deskripsi_kategori || '').trim() || null, image: f ? relPath(f) : null });
    req.flash('ok', 'Kategori ditambahkan.');
    res.redirect('/kelola/kategori');
  } catch (e) { bersihkan(req); next(e); }
});

router.get('/kategori/:id/edit', adminOnly, async (req, res, next) => {
  try {
    const kat = await CategoryProduct.findByPk(req.params.id);
    if (!kat) return next();
    res.render('kelola/kategori-form', { title: 'Ubah Kategori', kat, form: kat.toJSON(), error: null });
  } catch (e) { next(e); }
});

router.post('/kategori/:id', adminOnly, gambarKategori, async (req, res, next) => {
  try {
    const kat = await CategoryProduct.findByPk(req.params.id);
    if (!kat) { bersihkan(req); return next(); }
    const b = req.body;
    const nama = (b.name_kategori || '').trim();
    const error = req.uploadError || (!nama ? 'Nama kategori wajib diisi.' : nama.length > 100 ? 'Nama maksimal 100 karakter.' : null);
    if (error) { bersihkan(req); return res.status(400).render('kelola/kategori-form', { title: 'Ubah Kategori', kat, form: b, error }); }
    const data = { name_kategori: nama, deskripsi_kategori: (b.deskripsi_kategori || '').trim() || null };
    const f = (req.files.image || [])[0];
    if (f) { removeFile(kat.image); data.image = relPath(f); }
    await kat.update(data);
    req.flash('ok', 'Kategori diperbarui.');
    res.redirect('/kelola/kategori');
  } catch (e) { bersihkan(req); next(e); }
});

// Sama seperti model dosen (on_delete=CASCADE): produk di dalam kategori ikut terhapus
router.post('/kategori/:id/hapus', adminOnly, async (req, res, next) => {
  try {
    const kat = await CategoryProduct.findByPk(req.params.id, { include: [{ model: Product, as: 'products' }] });
    if (!kat) return next();
    for (const p of kat.products) await hapusProduk(p);
    removeFile(kat.image);
    await kat.destroy();
    req.flash('ok', 'Kategori dan seluruh produk di dalamnya dihapus.');
    res.redirect('/kelola/kategori');
  } catch (e) { next(e); }
});

/* ================= Pengguna (admin) ================= */
router.get('/pengguna', adminOnly, async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['id', 'ASC']] });
    const daftar = [];
    for (const u of users) daftar.push({ u, peran: await getRole(u) });
    res.render('kelola/pengguna', { title: 'Kelola Pengguna', daftar, ROLES });
  } catch (e) { next(e); }
});

router.post('/pengguna/:id/peran', adminOnly, async (req, res, next) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return next();
    if (!ROLES.includes(req.body.peran)) { req.flash('error', 'Peran tidak valid.'); return res.redirect('/kelola/pengguna'); }
    if (target.id === req.user.id) { req.flash('error', 'Kamu tidak bisa mengubah peranmu sendiri.'); return res.redirect('/kelola/pengguna'); }
    await setRole(target, req.body.peran);
    req.flash('ok', `Peran ${target.username} diubah.`);
    res.redirect('/kelola/pengguna');
  } catch (e) { next(e); }
});

module.exports = router;
