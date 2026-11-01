const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { requireLogin } = require('../middleware/auth');
const { Product, CategoryProduct, UserCostumer } = require('../models');
const { CheckoutKeranjang, CheckoutPesanan, CheckoutPesananItem, siapkan } = require('../models/pembayaran');
const sequelize = require('../db');
const cfg = require('../config/pembayaran');

const router = express.Router();
const FOLDER_PUBLIK = path.join(__dirname, '..', '..', 'public');
const FOLDER_BUKTI = path.join(FOLDER_PUBLIK, 'uploads', 'bukti');
fs.mkdirSync(FOLDER_BUKTI, { recursive: true });

const METODE = cfg.metode;
const EKSTENSI = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

/* ---------- upload bukti bayar ---------- */
const upload = multer({
  storage: multer.diskStorage({
    destination: FOLDER_BUKTI,
    filename: (req, file, cb) => cb(null, `bukti-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${EKSTENSI[file.mimetype]}`),
  }),
  limits: { fileSize: cfg.batasMB * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(EKSTENSI[file.mimetype] ? null : new Error('FORMAT'), !!EKSTENSI[file.mimetype]),
});
const unggah = (req, res, next) => upload.single('bukti')(req, res, (err) => {
  if (err) req.errUpload = err.code === 'LIMIT_FILE_SIZE'
    ? `Ukuran file maksimal ${cfg.batasMB} MB.`
    : 'Bukti bayar harus berupa gambar JPG, PNG, atau WEBP.';
  next();
});
const hapusFile = (rel) => {
  if (rel && rel.startsWith('/uploads/bukti/')) fs.unlink(path.join(FOLDER_PUBLIK, rel), () => {});
};

/* ---------- bantuan ---------- */
async function muatKeranjang(userId, opsi = {}) {
  const baris = await CheckoutKeranjang.findAll({ where: { user_id: userId }, order: [['id', 'ASC']], ...opsi });
  const produk = baris.length
    ? await Product.findAll({ where: { id: baris.map((b) => b.product_id) }, include: [{ model: CategoryProduct, as: 'category' }], ...opsi })
    : [];
  const peta = new Map(produk.map((p) => [p.id, p]));
  const items = baris.filter((b) => peta.has(b.product_id)).map((b) => {
    const p = peta.get(b.product_id);
    const jumlah = Math.max(1, Number(b.jumlah) || 1);
    const harga = Math.round(Number(p.price));
    return {
      produk: p, nama: p.name, kategori: p.category ? p.category.name_kategori : '',
      gambar: p.image || '', jumlah, harga, subtotal: harga * jumlah,
    };
  });
  return { items, total: items.reduce((s, i) => s + i.subtotal, 0), jumlahBaris: baris.length };
}

const hitungKeranjang = async (userId) => (await CheckoutKeranjang.sum('jumlah', { where: { user_id: userId } })) || 0;

async function nomorHpProfil(user) {
  try { const p = await UserCostumer.findOne({ where: { user_id: user.id } }); return (p && p.no_hp) || ''; } catch (e) { return ''; }
}

const namaLengkap = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username;

async function buatKode() {
  const t = new Date();
  const tgl = String(t.getFullYear()).slice(2) + String(t.getMonth() + 1).padStart(2, '0') + String(t.getDate()).padStart(2, '0');
  for (let i = 0; i < 10; i++) {
    const kode = `FC-${tgl}-${crypto.randomInt(1000, 10000)}`;
    if (!(await CheckoutPesanan.findOne({ where: { kode } }))) return kode;
  }
  return `FC-${tgl}-${Date.now()}`;
}

async function tampilkanForm(req, res, { status = 200, errors = null, nilai = {} } = {}) {
  const k = await muatKeranjang(req.user.id);
  if (!k.items.length) {
    req.flash('error', 'Keranjang kamu masih kosong.');
    return res.redirect('/keranjang');
  }
  const isi = {
    nama: nilai.nama ?? namaLengkap(req.user),
    no_hp: nilai.no_hp ?? await nomorHpProfil(req.user),
    catatan: nilai.catatan ?? String(req.query.catatan || ''),
    metode: nilai.metode || 'qris',
  };
  res.status(status).render('pembayaran', {
    title: 'Pembayaran', items: k.items, total: k.total, isi, errors, cfg, METODE,
    jumlahKeranjang: await hitungKeranjang(req.user.id),
  });
}

/* ---------- GET /pembayaran : halaman bayar ---------- */
router.get('/', requireLogin, async (req, res, next) => {
  try { await siapkan(); await tampilkanForm(req, res); } catch (e) { next(e); }
});

/* ---------- POST /pembayaran : buat pesanan ---------- */
router.post('/', requireLogin, unggah, async (req, res, next) => {
  const fileBaru = req.file ? '/uploads/bukti/' + req.file.filename : null;
  try {
    await siapkan();
    const nama = String(req.body.nama || '').trim();
    const hp = String(req.body.no_hp || '').replace(/[\s-]/g, '');
    const metode = String(req.body.metode || '');
    const catatan = String(req.body.catatan || '').trim().slice(0, 1000);

    const errors = [];
    if (nama.length < 2) errors.push('Nama wajib diisi.');
    if (!/^(\+62|62|0)8\d{7,12}$/.test(hp)) errors.push('Nomor WhatsApp tidak valid. Contoh: 081234567890.');
    if (!METODE[metode]) errors.push('Pilih salah satu metode pembayaran.');
    if (req.errUpload) errors.push(req.errUpload);
    if (errors.length) {
      hapusFile(fileBaru);
      return tampilkanForm(req, res, { status: 400, errors, nilai: { nama, no_hp: String(req.body.no_hp || ''), catatan, metode } });
    }

    const kode = await buatKode();
    const hasil = await sequelize.transaction(async (t) => {
      const k = await muatKeranjang(req.user.id, { transaction: t });
      if (!k.items.length) return null;
      const pesanan = await CheckoutPesanan.create({
        kode, user_id: req.user.id, nama_pelanggan: nama, no_hp: hp, total: k.total,
        status: 'menunggu', tahap: 0, catatan: catatan || null, metode_bayar: metode,
        bukti_bayar: fileBaru, status_bayar: fileBaru ? 'menunggu_verifikasi' : 'belum_bayar',
      }, { transaction: t });
      await CheckoutPesananItem.bulkCreate(k.items.map((i) => ({
        pesanan_id: pesanan.id, product_id: i.produk.id, nama: i.nama, kategori: i.kategori,
        harga: i.harga, satuan: i.produk.satuan || '', jumlah: i.jumlah, gambar: i.gambar,
      })), { transaction: t });
      await CheckoutKeranjang.destroy({ where: { user_id: req.user.id }, transaction: t });
      return pesanan;
    });

    if (!hasil) {
      hapusFile(fileBaru);
      req.flash('error', 'Keranjang kamu masih kosong.');
      return res.redirect('/keranjang');
    }
    req.flash('ok', 'Pesanan berhasil dibuat.');
    res.redirect('/pembayaran/selesai/' + encodeURIComponent(kode));
  } catch (e) { hapusFile(fileBaru); next(e); }
});

/* ---------- halaman setelah memesan ---------- */
async function ambilPesanan(req) {
  return CheckoutPesanan.findOne({
    where: { kode: req.params.kode, user_id: req.user.id },
    include: [{ model: CheckoutPesananItem, as: 'items' }],
  });
}

router.get('/selesai/:kode', requireLogin, async (req, res, next) => {
  try {
    await siapkan();
    const pesanan = await ambilPesanan(req);
    if (!pesanan) return res.status(404).render('error', { title: 'Tidak ditemukan', pesan: 'Pesanan tidak ditemukan.' });
    res.render('pembayaran-selesai', {
      title: 'Pesanan ' + pesanan.kode, pesanan, cfg, METODE,
      jumlahKeranjang: await hitungKeranjang(req.user.id),
    });
  } catch (e) { next(e); }
});

router.post('/selesai/:kode/bukti', requireLogin, unggah, async (req, res, next) => {
  const fileBaru = req.file ? '/uploads/bukti/' + req.file.filename : null;
  try {
    await siapkan();
    const pesanan = await ambilPesanan(req);
    const balik = '/pembayaran/selesai/' + encodeURIComponent(req.params.kode);
    if (!pesanan) { hapusFile(fileBaru); return res.status(404).render('error', { title: 'Tidak ditemukan', pesan: 'Pesanan tidak ditemukan.' }); }
    if (pesanan.status_bayar === 'lunas') { hapusFile(fileBaru); req.flash('error', 'Pesanan ini sudah lunas.'); return res.redirect(balik); }
    if (req.errUpload || !fileBaru) {
      hapusFile(fileBaru);
      req.flash('error', req.errUpload || 'Pilih file bukti bayar dulu.');
      return res.redirect(balik);
    }
    const lama = pesanan.bukti_bayar;
    await pesanan.update({ bukti_bayar: fileBaru, status_bayar: 'menunggu_verifikasi' });
    hapusFile(lama);
    req.flash('ok', 'Bukti bayar terkirim. Tim kami akan memeriksanya.');
    res.redirect(balik);
  } catch (e) { hapusFile(fileBaru); next(e); }
});

module.exports = router;