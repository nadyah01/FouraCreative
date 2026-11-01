// Model untuk keranjang, pesanan, dan item pesanan (tabel sudah ada di foura_creative.sql).
// Memakai nama model sendiri supaya tidak bentrok dengan kode lain.
// Kolom pembayaran baru ditambahkan otomatis ke tabel `pesanan` saat pertama dipakai,
// jadi tidak perlu SQL manual.
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const CheckoutKeranjang = sequelize.define('CheckoutKeranjang', {
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  jumlah:     { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'keranjang' });

const KOLOM_BARU = {
  no_hp:        { type: DataTypes.STRING(20),  allowNull: true },
  nama_umkm:    { type: DataTypes.STRING(150), allowNull: true },
  email:        { type: DataTypes.STRING(255), allowNull: true },
  alamat:       { type: DataTypes.TEXT,        allowNull: true },
  metode_bayar: { type: DataTypes.STRING(30),  allowNull: true },
  bukti_bayar:  { type: DataTypes.STRING(255), allowNull: true },
  bukti_data:   { type: DataTypes.TEXT('long'), allowNull: true },
  bukti_mime:   { type: DataTypes.STRING(30),  allowNull: true },
  status_bayar: { type: DataTypes.STRING(30),  allowNull: true, defaultValue: 'belum_bayar' },
};

const CheckoutPesanan = sequelize.define('CheckoutPesanan', {
  kode:           { type: DataTypes.STRING, unique: true },
  user_id:        { type: DataTypes.INTEGER, allowNull: false },
  nama_pelanggan: { type: DataTypes.STRING, defaultValue: '' },
  total:          { type: DataTypes.INTEGER, defaultValue: 0 },
  status:         { type: DataTypes.STRING, defaultValue: 'menunggu' },
  tahap:          { type: DataTypes.INTEGER, defaultValue: 0 },
  tahap_tanggal:  { type: DataTypes.TEXT, allowNull: true },
  catatan:        { type: DataTypes.TEXT, allowNull: true },
  ...KOLOM_BARU,
}, { tableName: 'pesanan' });

const CheckoutPesananItem = sequelize.define('CheckoutPesananItem', {
  pesanan_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  nama:       { type: DataTypes.STRING },
  kategori:   { type: DataTypes.STRING, defaultValue: '' },
  harga:      { type: DataTypes.INTEGER, defaultValue: 0 },
  satuan:     { type: DataTypes.STRING, defaultValue: '' },
  jumlah:     { type: DataTypes.INTEGER, defaultValue: 1 },
  gambar:     { type: DataTypes.STRING, defaultValue: '' },
  fitur:      { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'pesanan_item' });

CheckoutPesanan.hasMany(CheckoutPesananItem, { foreignKey: 'pesanan_id', as: 'items' });

let siap = null;
// Buat tabel bila belum ada, lalu tambahkan kolom pembayaran yang belum ada. Aman dipanggil berulang.
function siapkan() {
  if (!siap) {
    siap = (async () => {
      await CheckoutKeranjang.sync();
      await CheckoutPesanan.sync();
      await CheckoutPesananItem.sync();
      const qi = sequelize.getQueryInterface();
      const ada = await qi.describeTable('pesanan');
      for (const [nama, def] of Object.entries(KOLOM_BARU)) {
        if (!ada[nama]) await qi.addColumn('pesanan', nama, def);
      }
    })().catch((e) => { siap = null; throw e; });
  }
  return siap;
}

module.exports = { CheckoutKeranjang, CheckoutPesanan, CheckoutPesananItem, siapkan };