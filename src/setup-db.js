require('dotenv').config();
const { sequelize, CategoryProduct, Product } = require('./models');
const { kategori: DATA } = require('./services/katalog-data');
require('./services/pesanan'); // mendaftarkan tabel keranjang, pesanan, pesanan_item

const norm = s => String(s).toLowerCase().replace(/^paket\s+/, '').trim();

async function samakanKatalog() {
  const keepProduk = new Set();
  const keepKat = new Set();
  const semuaProduk = await Product.findAll();

  for (const k of DATA) {
    let kat = await CategoryProduct.findOne({ where: { name_kategori: k.name_kategori } });
    if (kat) await kat.update({ deskripsi_kategori: k.deskripsi_kategori });
    else kat = await CategoryProduct.create({ name_kategori: k.name_kategori, deskripsi_kategori: k.deskripsi_kategori });
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
  for (const r of semuaProduk) {
    if (!keepProduk.has(r.id)) { try { await r.destroy(); } catch (e) { console.warn('Produk lama tidak bisa dihapus:', r.name); } }
  }
  for (const c of await CategoryProduct.findAll()) {
    if (!keepKat.has(c.id)) { try { await c.destroy(); } catch (e) { /* abaikan */ } }
  }
}

(async () => {
  try {
    await sequelize.sync(); // membuat semua tabel yang belum ada
    await samakanKatalog();
    console.log('Katalog disiapkan sesuai daftar harga FIX.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();