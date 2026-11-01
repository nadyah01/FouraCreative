const { removeFile } = require('./files');

// Hapus produk beserta semua file gambarnya
async function hapusProduk(produk) {
  const media = await produk.getGambar_tambahan();
  for (const m of media) { removeFile(m.file); await m.destroy(); }
  removeFile(produk.image);
  await produk.destroy();
}

module.exports = { hapusProduk };
