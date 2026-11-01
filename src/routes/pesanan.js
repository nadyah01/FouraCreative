const router = require('express').Router();
const { Product, CategoryProduct } = require('../models');
const { ProdukInfo } = require('../services/produk-info');
const {
  Keranjang, Pesanan, TAHAP, LABEL_STATUS, PesananItem,
  pastikanTabel, fmt, judulPesanan, itemPerPesanan,
  dataAdmin, dataUser,
} = require('../services/pesanan');
const wajibLogin = (req, res, next) => (res.locals.user ? next() : res.redirect('/masuk'));
const wajibAdmin = (req, res, next) => {
  if (!res.locals.user) return res.redirect('/masuk');
  if (!['admin', 'seller'].includes(res.locals.role)) return res.status(403).send('Akses ditolak.');
  next();
};

// Jumlah isi keranjang untuk header (dipasang di public.js)
router.localsKeranjang = async (req, res, next) => {
  res.locals.jumlahKeranjang = 0;
  res.locals.idKeranjang = [];
  try {
    if (res.locals.user) {
      await pastikanTabel();
      const baris = await Keranjang.findAll({ where: { userId: res.locals.user.id } });
      res.locals.idKeranjang = baris.map(b => b.productId);
      res.locals.jumlahKeranjang = baris.reduce((s, b) => s + b.jumlah, 0);
    }
  } catch (e) { /* abaikan */ }
  next();
};

// Isi keranjang lengkap dengan harga terbaru
async function isiKeranjang(userId) {
  const baris = await Keranjang.findAll({ where: { userId }, order: [['id', 'ASC']] });
  const hasil = [];
  for (const b of baris) {
    const p = await Product.findByPk(b.productId, { include: [{ model: CategoryProduct, as: 'category' }] });
    if (!p) { await b.destroy(); continue; }
    const info = await ProdukInfo.findOne({ where: { productId: p.id } });
    hasil.push({
      id: b.id, productId: p.id, nama: p.name,
      kategori: p.category ? p.category.name_kategori : '',
      harga: Math.round(Number(p.price)),
      satuan: info ? info.satuan : '',
      gambar: info ? info.gambar : '',
      fitur: info ? info.fitur : '',
      jumlah: b.jumlah,
    });
  }
  return hasil;
}

// ---------- KERANJANG ----------
const mintaJson = req => (req.get('accept') || '').includes('application/json');
const jumlahIsi = async uid => (await Keranjang.sum('jumlah', { where: { userId: uid } })) || 0;

router.post('/keranjang/tambah', async (req, res, next) => {
  try {
    if (!res.locals.user) return mintaJson(req) ? res.status(401).json({ login: true }) : res.redirect('/masuk');
    await pastikanTabel();
    const produk = await Product.findByPk(req.body.produkId);
    if (!produk) return mintaJson(req) ? res.status(404).json({ ok: false }) : res.redirect('/katalog');
    const uid = res.locals.user.id;
    const ada = await Keranjang.findOne({ where: { userId: uid, productId: produk.id } });
    if (!ada) await Keranjang.create({ userId: uid, productId: produk.id, jumlah: 1 });
    if (mintaJson(req)) return res.json({ ok: true, jumlah: await jumlahIsi(uid) });
    res.redirect(req.get('referer') || '/katalog');
  } catch (e) { next(e); }
});

router.post('/keranjang/batal', async (req, res, next) => {
  try {
    if (!res.locals.user) return mintaJson(req) ? res.status(401).json({ login: true }) : res.redirect('/masuk');
    await pastikanTabel();
    const uid = res.locals.user.id;
    await Keranjang.destroy({ where: { userId: uid, productId: req.body.produkId } });
    if (mintaJson(req)) return res.json({ ok: true, jumlah: await jumlahIsi(uid) });
    res.redirect(req.get('referer') || '/katalog');
  } catch (e) { next(e); }
});

router.get('/keranjang', wajibLogin, async (req, res, next) => {
  try {
    await pastikanTabel();
    const item = await isiKeranjang(res.locals.user.id);
    const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);
    res.render('keranjang', { title: 'Keranjang', item, total });
  } catch (e) { next(e); }
});

router.post('/keranjang/:id/ubah', wajibLogin, async (req, res, next) => {
  try {
    await pastikanTabel();
    const b = await Keranjang.findOne({ where: { id: req.params.id, userId: res.locals.user.id } });
    if (b) {
      const baru = b.jumlah + (req.body.aksi === 'kurang' ? -1 : 1);
      if (baru < 1) await b.destroy(); else await b.update({ jumlah: baru });
    }
    res.redirect('/keranjang');
  } catch (e) { next(e); }
});

router.post('/keranjang/:id/hapus', wajibLogin, async (req, res, next) => {
  try {
    await pastikanTabel();
    await Keranjang.destroy({ where: { id: req.params.id, userId: res.locals.user.id } });
    res.redirect('/keranjang');
  } catch (e) { next(e); }
});

// ---------- CHECKOUT: membuat pesanan ----------
router.post('/checkout', wajibLogin, async (req, res, next) => {
  return res.redirect('/keranjang'); // SEMENTARA: dinonaktifkan sampai fitur pembayaran dibuat
  try {
    await pastikanTabel();
    const u = res.locals.user;
    const item = await isiKeranjang(u.id);
    if (!item.length) return res.redirect('/keranjang');

    const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);
    const p = await Pesanan.create({
      kode: 'tmp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: u.id,
      namaPelanggan: u.first_name || u.username,
      total, status: 'menunggu', tahap: 0, tahapTanggal: '{}',
      catatan: (req.body.catatan || '').trim(),
    });
    const d = new Date();
    const kode = '#FC' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(p.id).padStart(3, '0');
    await p.update({ kode });

    await PesananItem.bulkCreate(item.map(i => ({
      pesananId: p.id, productId: i.productId, nama: i.nama, kategori: i.kategori,
      harga: i.harga, satuan: i.satuan, jumlah: i.jumlah, gambar: i.gambar, fitur: i.fitur,
    })));
    await Keranjang.destroy({ where: { userId: u.id } });
    res.redirect('/dashboard');
  } catch (e) { next(e); }
});

// ---------- RIWAYAT PESANAN (pelanggan) ----------
router.get('/riwayat', wajibLogin, async (req, res, next) => {
  try {
    await pastikanTabel();
    const jenis = ['paket', 'satuan'].includes(req.query.jenis) ? req.query.jenis : 'semua';
    const semua = await Pesanan.findAll({ where: { userId: res.locals.user.id }, order: [['createdAt', 'DESC']] });
    const per = await itemPerPesanan(semua.map(p => p.id));

    let daftar = semua.map(p => {
      const it = per[p.id] || [];
      return {
        kode: p.kode, tanggal: fmt(p.createdAt), total: p.total, status: p.status, tahap: p.tahap,
        judul: judulPesanan(it), items: it, isPaket: it.some(i => i.kategori === 'Paket Bundling'),
        gambar: (it[0] && it[0].gambar) || '',
      };
    });
    if (jenis === 'paket') daftar = daftar.filter(d => d.isPaket);
    if (jenis === 'satuan') daftar = daftar.filter(d => !d.isPaket);

    res.render('riwayat', { title: 'Riwayat Pesanan', daftar, jenis, TAHAP, LABEL_STATUS });
  } catch (e) { next(e); }
});

// ---- Dashboard: admin/seller dan pelanggan dibedakan, isi dari database ----
router.get('/dashboard', async (req, res, next) => {
  try {
    const u = res.locals.user;
    if (!u) return res.redirect('/masuk');
    await pastikanTabel();

    const role = res.locals.role;
    const nama = u.first_name || u.username || 'Pengguna';
    const LABEL_ROLE = { admin: 'Admin', seller: 'Seller', customer: 'Member' };
    const dasar = { nama, role, peran: LABEL_ROLE[role] || 'Member' };

    if (role === 'admin' || role === 'seller') {
      const kategori = await CategoryProduct.findAll({ include: [{ model: Product, as: 'products' }] });
      const totalProduk = await Product.count();
      const terbaruDb = await Product.findAll({
        order: [['createdAt', 'DESC']], limit: 5,
        include: [{ model: CategoryProduct, as: 'category' }],
      });
      const M = require('../models');
      const UserModel = M.User || M.Pengguna;
      let totalPengguna = null;
      if (UserModel && typeof UserModel.count === 'function') totalPengguna = await UserModel.count();

      return res.render('dashboard', {
        ...dasar,
        mode: 'admin',
        totalProduk,
        totalKategori: kategori.length,
        totalPengguna,
        perKategori: kategori.map(k => ({ nama: k.name_kategori, jumlah: (k.products || []).length })),
        produkTerbaru: terbaruDb.map(p => ({
          nama: p.name,
          kategori: p.category ? p.category.name_kategori : '-',
          harga: Number(p.price),
        })),
        ...(await dataAdmin()),
      });
    }

    return res.render('dashboard', { ...dasar, mode: 'user', ...(await dataUser(u.id)) });
  } catch (e) { next(e); }
});

// ---------- KELOLA PESANAN (admin/seller) ----------
router.get('/admin/pesanan', wajibAdmin, async (req, res, next) => {
  try {
    await pastikanTabel();
    const semua = await Pesanan.findAll({ order: [['createdAt', 'DESC']] });
    const per = await itemPerPesanan(semua.map(p => p.id));
    const daftar = semua.map(p => ({
      id: p.id, kode: p.kode, pelanggan: p.namaPelanggan, tanggal: fmt(p.createdAt),
      total: p.total, status: p.status, tahap: p.tahap, catatan: p.catatan,
      items: per[p.id] || [],
    }));
    res.render('admin-pesanan', { title: 'Kelola Pesanan', daftar, TAHAP, LABEL_STATUS });
  } catch (e) { next(e); }
});

router.post('/admin/pesanan/:id/tahap', wajibAdmin, async (req, res, next) => {
  try {
    await pastikanTabel();
    const p = await Pesanan.findByPk(req.params.id);
    if (!p) return next();
    const n = Math.min(Math.max(parseInt(req.body.tahap, 10) || 0, 0), TAHAP.length);
    const tgl = JSON.parse(p.tahapTanggal || '{}');
    const sekarang = new Date().toISOString();
    TAHAP.forEach((_, i) => { if (i < n) { if (!tgl[i]) tgl[i] = sekarang; } else delete tgl[i]; });
    await p.update({
      tahap: n,
      tahapTanggal: JSON.stringify(tgl),
      status: n === 0 ? 'menunggu' : (n >= TAHAP.length ? 'selesai' : 'dikerjakan'),
    });
    res.redirect('/admin/pesanan');
  } catch (e) { next(e); }
});

module.exports = router;

