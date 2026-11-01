// Contoh pemakaian + pembuktian relasi. PERHATIAN: menghapus & membuat ulang semua tabel.
const { sequelize, User, UserCostumer, MediaFile, CategoryProduct, Product } = require('./models');

(async () => {
  await sequelize.sync({ force: true });

  const user = await User.create({ username: 'budi', password: 'rahasia123', first_name: 'Budi' });
  await UserCostumer.create({ user_id: user.id, alamat: 'Jl. Pettarani, Makassar', no_hp: '0812xxxx' });
  console.log('User     :', user.toString(), '| password ter-hash:', user.password.startsWith('$2'));
  console.log('Login ok :', await user.checkPassword('rahasia123'));

  const kategori = await CategoryProduct.create({ name_kategori: 'Paket Bundling', deskripsi_kategori: 'Paket hemat' });
  const produk = await Product.create({ name: 'Paket Pro', price: 2500000, category_id: kategori.id });
  const foto = await MediaFile.create({ file: 'media_files/contoh.jpg' });
  await produk.addGambar_tambahan(foto);

  const hasil = await CategoryProduct.findOne({
    include: [{ model: Product, as: 'products', include: [{ model: MediaFile, as: 'gambar_tambahan' }] }],
  });
  console.log('Kategori :', hasil.name_kategori);
  console.log('Produk   :', hasil.products.map(p => `${p.name} (Rp ${p.price})`).join(', '));
  console.log('Gambar   :', hasil.products[0].gambar_tambahan.map(m => m.file).join(', '));

  const profil = await User.findByPk(user.id, { include: [{ model: UserCostumer, as: 'UserCostumer' }] });
  console.log('Profil   :', profil.UserCostumer.alamat);

  await user.destroy(); // CASCADE: profil ikut terhapus
  console.log('Setelah user dihapus, profil tersisa:', await UserCostumer.count());
  await sequelize.close();
})();
