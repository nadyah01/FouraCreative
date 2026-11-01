// Data awal: HANYA akun contoh. Katalog (kategori & produk) diatur oleh katalog-data.js.
// Aman dijalankan berulang kali (akun yang sudah ada tidak ditimpa).
const { sequelize, User, UserCostumer, UserAdmin } = require('./models');

async function buatUser(data, Profil) {
  let u = await User.findOne({ where: { username: data.username } });
  if (!u) u = await User.create(data);
  await Profil.findOrCreate({ where: { user_id: u.id } });
}

(async () => {
  await sequelize.sync();

  await buatUser({ username: 'admin', password: 'admin12345', first_name: 'Admin Foura', email: 'admin@foura.test' }, UserAdmin);
  await buatUser({ username: 'budi',  password: 'budi12345',  first_name: 'Budi',        email: 'budi@foura.test' }, UserCostumer);

  console.log('Seed selesai. Akun contoh:');
  console.log('  admin / admin12345');
  console.log('  budi  / budi12345  (klien)');
  await sequelize.close();
})();