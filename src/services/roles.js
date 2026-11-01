const { UserCostumer, UserAdmin } = require('../models');

const MODEL_BY_ROLE = { customer: UserCostumer, admin: UserAdmin };
const ROLES = Object.keys(MODEL_BY_ROLE);
const LABEL = { customer: 'Klien', admin: 'Admin' };

// Peran ditentukan dari tabel profil mana yang berisi user ini
async function getRole(user) {
  if (await UserAdmin.findOne({ where: { user_id: user.id } })) return 'admin';
  return 'customer';
}

async function getProfile(user, role) {
  const Model = MODEL_BY_ROLE[role];
  const [profil] = await Model.findOrCreate({ where: { user_id: user.id } });
  return profil;
}

// Pindah peran: data alamat & no_hp ikut dipindahkan
async function setRole(user, role) {
  if (!MODEL_BY_ROLE[role]) throw new Error('Peran tidak dikenal');
  const sekarang = await getRole(user);
  if (sekarang === role) return;
  const lama = await getProfile(user, sekarang);
  const { alamat, no_hp, foto } = lama;
  await Promise.all(Object.values(MODEL_BY_ROLE).map(M => M.destroy({ where: { user_id: user.id } })));
  await MODEL_BY_ROLE[role].create({ user_id: user.id, alamat, no_hp, foto });
}

module.exports = { ROLES, LABEL, getRole, getProfile, setRole };