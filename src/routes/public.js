const router = require('express').Router();
const { CategoryProduct, Product, MediaFile } = require('../models');
const { hitung, KATEGORI_PAKET } = require('../services/kalkulator');
const { kategori: DATA } = require('../services/katalog-data');
const pesananRouter = require('./pesanan');
const { pastikanTabel, dataUser, dataAdmin } = require('../services/pesanan');
router.use(pesananRouter.localsKeranjang);


// "Pro" dan "Paket Pro" dianggap produk yang sama
const norm = s => String(s).toLowerCase().replace(/^paket\s+/, '').trim();

// ---- Sinkronisasi database dengan daftar harga FIX (jalan sekali) ----
async function sinkron() {
  const keepProduk = new Set();
  const keepKat = new Set();
  const semuaProduk = await Product.findAll();

  for (const k of DATA) {
    let kat = await CategoryProduct.findOne({ where: { name_kategori: k.name_kategori } });
    if (kat) {
      await kat.update({ deskripsi_kategori: k.deskripsi_kategori });
    } else {
      kat = await CategoryProduct.create({
        name_kategori: k.name_kategori,
        deskripsi_kategori: k.deskripsi_kategori,
      });
    }
    keepKat.add(kat.id);

    for (const p of k.products) {
      let row = semuaProduk.find(r => norm(r.name) === norm(p.name) && !keepProduk.has(r.id));
      if (row) {
        await row.update({ name: p.name, deskripsi: p.deskripsi, price: p.price });
        if (typeof row.setCategory === 'function') await row.setCategory(kat);
      } else {
        row = await kat.createProduct({ name: p.name, deskripsi: p.deskripsi, price: p.price });
        semuaProduk.push(row);
      }
      keepProduk.add(row.id);
    }
  }

  // Hapus produk dan kategori lama yang tidak ada di daftar FIX
  for (const r of semuaProduk) {
    if (!keepProduk.has(r.id)) {
      try { await r.destroy(); } catch (e) { console.warn('Produk lama tidak bisa dihapus:', r.name); }
    }
  }
  const semuaKat = await CategoryProduct.findAll();
  for (const c of semuaKat) {
    if (!keepKat.has(c.id)) {
      try { await c.destroy(); } catch (e) { /* abaikan */ }
    }
  }
  console.log('Katalog disinkronkan dengan daftar harga FIX.');
}

const pastikan = async () => {};

// ---- Data tambahan katalog (satuan, fitur, waktu, label populer) ----
const META = {};
const URUT_PRODUK = [];
DATA.forEach(k => k.products.forEach(p => {
  META[norm(p.name)] = {
    satuan: p.satuan,
    tipe: p.tipe,
    populer: !!p.populer,
    fitur: p.fitur || [],
    catatan: p.catatan || '',
    waktu: p.waktu || '',
    gambar: p.gambar || '',
  };
  URUT_PRODUK.push(norm(p.name));
}));
const URUT_KATEGORI = DATA.map(k => k.name_kategori);
const idx = (arr, v) => { const i = arr.indexOf(v); return i === -1 ? 999 : i; };

// ---- Beranda ----
router.get('/', async (req, res, next) => {
  try {
    await pastikan();
    const kategori = await CategoryProduct.findAll({ order: [['name_kategori', 'ASC']] });
    const produk = await Product.findAll({
      order: [['createdAt', 'DESC']], limit: 6,
      include: [{ model: CategoryProduct, as: 'category' }],
    });
    // paket bundling, diurutkan dari termurah, untuk kalkulator
    const paket = await Product.findAll({
      include: [{ model: CategoryProduct, as: 'category', where: { name_kategori: KATEGORI_PAKET }, attributes: [] }],
      order: [['price', 'ASC']],
    });
    const kalk = hitung(req.query, paket);
    res.render('beranda', { title: 'Beranda', kategori, produk, kalk });
  } catch (e) { next(e); }
});

// ---- Katalog: Paket Bundling paling atas, lalu jasa satuan ----
router.get('/katalog', async (req, res, next) => {
  try {
    await pastikan();
    const n = parseInt(req.query.kategori, 10);
    const aktif = Number.isInteger(n) ? n : null;
    const urut = ['tertinggi', 'terendah'].includes(req.query.urut) ? req.query.urut : 'rekomendasi';

    const hasil = await CategoryProduct.findAll({
      include: [{ model: Product, as: 'products' }],
    });

    const semuaKategori = hasil
      .map(k => k.get({ plain: true }))
      .sort((a, b) => idx(URUT_KATEGORI, a.name_kategori) - idx(URUT_KATEGORI, b.name_kategori));

    semuaKategori.forEach(k => {
      k.products.forEach(p => Object.assign(p, META[norm(p.name)] || {}));
      k.products.sort((a, b) => {
        if (urut === 'tertinggi') return Number(b.price) - Number(a.price);
        if (urut === 'terendah') return Number(a.price) - Number(b.price);
        return idx(URUT_PRODUK, norm(a.name)) - idx(URUT_PRODUK, norm(b.name));
      });
    });

    const sections = aktif ? semuaKategori.filter(k => k.id === aktif) : semuaKategori;
    res.render('katalog', { title: 'Katalog Layanan', semuaKategori, sections, aktif, urut });
  } catch (e) { next(e); }
});



// ---- Detail produk ----
router.get('/produk/:id', async (req, res, next) => {
  try {
    const produk = await Product.findByPk(req.params.id, {
      include: [{ model: CategoryProduct, as: 'category' }, { model: MediaFile, as: 'gambar_tambahan' }],
    });
    if (!produk) return next();
    res.render('produk', { title: produk.name, produk });
  } catch (e) { next(e); }
});

router.get('/syarat-ketentuan', (req, res) => {
  res.render('syarat', { title: 'Syarat dan Ketentuan' });
});

router.use(pesananRouter);

module.exports = router;

