const { Product } = require('../models');
const { kategori: DATA } = require('./katalog-data');

// "Pro" dan "Paket Pro" dianggap produk yang sama
const norm = s => String(s).toLowerCase().replace(/^paket\s+/, '').trim();

const META = {};
DATA.forEach(k => k.products.forEach(p => {
  META[norm(p.name)] = {
    satuan: p.satuan || '',
    gambar: p.gambar || '',
    fitur: (p.fitur || []).join('\n'),
  };
}));

// Meniru model: ProdukInfo.findOne({ where: { productId } })
const ProdukInfo = {
  async findOne({ where }) {
    const p = await Product.findByPk(where.productId);
    if (!p) return null;
    return META[norm(p.name)] || null;
  },
};

module.exports = { ProdukInfo };