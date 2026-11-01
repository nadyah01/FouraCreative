// Membuat tabel (setara python manage.py migrate)
const { sequelize } = require('./models');

(async () => {
  await sequelize.sync();
  console.log('Tabel berhasil dibuat di db.sqlite3');
  await sequelize.close();
})();
