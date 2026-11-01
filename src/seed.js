// Data awal: HANYA akun contoh. Katalog (kategori & produk) diatur oleh katalog-data.js
// lewat "npm run setup". Password dibaca dari file .env, TIDAK ditulis di kode.
// Aman dijalankan berulang kali (akun yang sudah ada tidak ditimpa).
require('dotenv').config();
const { sequelize, User, UserCostumer, UserAdmin } = require('./models');

const USER_ADMIN = process.env.SEED_ADMIN_USER || 'admin';
const PASS_ADMIN = process.env.SEED_ADMIN_PASS;
const PASS_BUDI = process.env.SEED_BUDI_PASS; // opsional: kosongkan kalau tidak perlu akun klien contoh

function wajibKuat(nama, nilai) {
  if (!nilai || nilai.length < 12) {
    console.error(nama + ' belum diisi di file .env, atau kurang dari 12 karakter.');
    process.exit(1);
  }
}

async function buatUser(data, Profil) {
  let u = await User.findOne({ where: { username: data.username } });
  if (!u) u = await User.create(data);
  await Profil.findOrCreate({ where: { user_id: u.id } });
}

(async () => {
  wajibKuat('SEED_ADMIN_PASS', PASS_ADMIN);
  if (PASS_BUDI) wajibKuat('SEED_BUDI_PASS', PASS_BUDI);

  await sequelize.sync();

  await buatUser({ username: USER_ADMIN, password: PASS_ADMIN, first_name: 'Admin Foura', email: 'admin@foura.test' }, UserAdmin);
  if (PASS_BUDI) {
    await buatUser({ username: 'budi', password: PASS_BUDI, first_name: 'Budi', email: 'budi@foura.test' }, UserCostumer);
  }

  console.log('Seed selesai. Akun dibuat: ' + USER_ADMIN + (PASS_BUDI ? ', budi' : '') + ' (password sesuai file .env).');
  await sequelize.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});