const { DataTypes, Op } = require('sequelize');
const { Product } = require('../models');

const sequelize = Product.sequelize;

const TAHAP = ['Brief & Diskusi', 'Produksi Konten', 'Revisi', 'Approval Klien', 'Upload & Publishing'];
const LABEL_STATUS = { menunggu: 'Menunggu', dikerjakan: 'Sedang Dikerjakan', selesai: 'Selesai' };

const Keranjang = sequelize.define('Keranjang', {
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  jumlah:    { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'keranjang' });

const Pesanan = sequelize.define('Pesanan', {
  kode:          { type: DataTypes.STRING, unique: true },
  userId:        { type: DataTypes.INTEGER, allowNull: false },
  namaPelanggan: { type: DataTypes.STRING, defaultValue: '' },
  total:         { type: DataTypes.INTEGER, defaultValue: 0 },
  status:        { type: DataTypes.STRING, defaultValue: 'menunggu' },
  tahap:         { type: DataTypes.INTEGER, defaultValue: 0 },
  tahapTanggal:  { type: DataTypes.TEXT, defaultValue: '{}' },
  catatan:       { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'pesanan' });

const PesananItem = sequelize.define('PesananItem', {
  pesananId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER },
  nama:      { type: DataTypes.STRING },
  kategori:  { type: DataTypes.STRING, defaultValue: '' },
  harga:     { type: DataTypes.INTEGER, defaultValue: 0 },
  satuan:    { type: DataTypes.STRING, defaultValue: '' },
  jumlah:    { type: DataTypes.INTEGER, defaultValue: 1 },
  gambar:    { type: DataTypes.STRING, defaultValue: '' },
  fitur:     { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'pesanan_item' });

// Membuat tabel kalau belum ada (sekali saja)
let tabel = null;
const pastikanTabel = () => tabel || (tabel = (async () => {
  await Keranjang.sync();
  await Pesanan.sync();
  await PesananItem.sync();
})());

const fmt = d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtPendek = d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
const plain = r => r.get({ plain: true });

function judulPesanan(items) {
  if (!items || !items.length) return 'Pesanan';
  return items[0].nama + (items.length > 1 ? ' + ' + (items.length - 1) + ' layanan lain' : '');
}

async function itemPerPesanan(ids) {
  const per = {};
  if (!ids.length) return per;
  const items = await PesananItem.findAll({ where: { pesananId: { [Op.in]: ids } }, order: [['id', 'ASC']] });
  items.forEach(i => { (per[i.pesananId] = per[i.pesananId] || []).push(plain(i)); });
  return per;
}

// ---- Data dashboard pelanggan (kosong kalau belum pernah memesan) ----
async function dataUser(userId) {
  await pastikanTabel();
  const semua = await Pesanan.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  const per = await itemPerPesanan(semua.map(p => p.id));
  const sekarang = new Date();

  // Paket aktif: pesanan terbaru yang berisi Paket Bundling dan belum lewat 1 bulan
  let paket = null;
  for (const p of semua) {
    const it = (per[p.id] || []).find(i => i.kategori === 'Paket Bundling');
    if (!it) continue;
    const akhir = new Date(p.createdAt);
    akhir.setMonth(akhir.getMonth() + 1);
    if (akhir > sekarang) {
      paket = {
        nama: it.nama.replace(/^Paket\s+/, ''),
        harga: it.harga,
        satuan: it.satuan || 'bulan',
        berakhir: fmt(akhir),
        benefit: it.fitur ? String(it.fitur).split(/\r?\n/).filter(Boolean) : [],
      };
      break;
    }
  }

  const sebulanLalu = new Date(sekarang.getTime() - 30 * 24 * 3600 * 1000);
  const totalPesanan = semua.filter(p => p.createdAt >= sebulanLalu).length;

  const pesanan = semua.slice(0, 3).map(p => {
    const it = per[p.id] || [];
    return {
      id: p.id, kode: p.kode, judul: judulPesanan(it), tanggal: fmt(p.createdAt),
     harga: p.total, satuan: it.length === 1 ? (it[0].satuan || '') : '', status: p.status, gambar: (it[0] && it[0].gambar) || '',
    };
  });

  // Progress: pesanan terbaru yang belum selesai
  let progress = null, progressKode = null;
  const aktif = semua.find(p => p.status !== 'selesai');
  if (aktif) {
    const tgl = JSON.parse(aktif.tahapTanggal || '{}');
    progress = TAHAP.map((label, i) => ({ label, selesai: i < aktif.tahap, tanggal: tgl[i] ? fmtPendek(tgl[i]) : '' }));
    progressKode = aktif.kode;
  }

  const aktivitas = semua.slice(0, 5).map(p => ({
    judul: 'Pesanan ' + p.kode,
    ket: judulPesanan(per[p.id]),
    tanggal: fmtPendek(p.createdAt) + ' · ' + LABEL_STATUS[p.status],
    selesai: p.status === 'selesai',
  }));

  return { paket, totalPesanan, pesanan, progress, progressKode, aktivitas };
}

// ---- Data dashboard admin / seller ----
async function dataAdmin() {
  await pastikanTabel();
  const semua = await Pesanan.findAll({ order: [['createdAt', 'DESC']] });
  const terbaru = semua.slice(0, 5);
  const per = await itemPerPesanan(terbaru.map(p => p.id));

  const awalBulan = new Date();
  awalBulan.setDate(1);
  awalBulan.setHours(0, 0, 0, 0);
  const bulanIni = semua.filter(p => p.createdAt >= awalBulan);

  return {
    pesananBaru: semua.filter(p => p.status === 'menunggu').length,
    pesananMasuk: terbaru.map(p => ({
      kode: p.kode, pelanggan: p.namaPelanggan, layanan: judulPesanan(per[p.id]), total: p.total, status: p.status,
    })),
    ringkasan: {
      nilai: bulanIni.reduce((s, p) => s + p.total, 0),
      jumlahBulanIni: bulanIni.length,
      menunggu: semua.filter(p => p.status === 'menunggu').length,
      dikerjakan: semua.filter(p => p.status === 'dikerjakan').length,
      selesai: semua.filter(p => p.status === 'selesai').length,
    },
    aktivitas: terbaru.map(p => ({
      judul: 'Pesanan ' + p.kode,
      ket: p.namaPelanggan + ' memesan ' + judulPesanan(per[p.id]),
      tanggal: fmtPendek(p.createdAt) + ' · ' + LABEL_STATUS[p.status],
      selesai: p.status === 'selesai',
    })),
  };
}

module.exports = {
  Keranjang, Pesanan, PesananItem, TAHAP, LABEL_STATUS,
  pastikanTabel, fmt, fmtPendek, judulPesanan, itemPerPesanan, dataUser, dataAdmin,
};

