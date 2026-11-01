const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../db');

/* ---------- User (setara django.contrib.auth.models.User) ---------- */
const User = sequelize.define('User', {
  username:   { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password:   { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING(150), defaultValue: '' },
  last_name:  { type: DataTypes.STRING(150), defaultValue: '' },
  email:      { type: DataTypes.STRING, defaultValue: '' },
}, {
  tableName: 'auth_user',
  hooks: {
    // password otomatis di-hash, seperti Django
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});
User.prototype.checkPassword = function (plain) { return bcrypt.compare(plain, this.password); };
User.prototype.toString = function () { return `${this.username} - ${this.first_name}`; };

/* ---------- Profil per peran: Costumer (klien) dan Admin ---------- */
const profilFields = () => ({
  alamat: { type: DataTypes.TEXT, allowNull: true },
  no_hp:  { type: DataTypes.STRING(20), allowNull: true },
  foto:   { type: DataTypes.STRING(255), allowNull: true },
});

const UserCostumer = sequelize.define('UserCostumer', {
  ...profilFields(),
  nama_umkm: { type: DataTypes.STRING(150), allowNull: true },
}, { tableName: 'user_costumer' });
const UserAdmin    = sequelize.define('UserAdmin',    profilFields(), { tableName: 'user_admin' });

for (const Profil of [UserCostumer, UserAdmin]) {
  // OneToOneField(User, on_delete=CASCADE)
  User.hasOne(Profil, { foreignKey: { name: 'user_id', allowNull: false, unique: true }, onDelete: 'CASCADE', as: Profil.name });
  Profil.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

/* ---------- MediaFile ---------- */
const MediaFile = sequelize.define('MediaFile', {
  file: { type: DataTypes.STRING, allowNull: false }, // path file, mis. media_files/foto.jpg
}, {
  tableName: 'media_file',
  createdAt: 'uploaded_at',
  updatedAt: false,
});

/* ---------- CategoryProduct ---------- */
const CategoryProduct = sequelize.define('CategoryProduct', {
  name_kategori:      { type: DataTypes.STRING(100), allowNull: false },
  deskripsi_kategori: { type: DataTypes.TEXT, allowNull: true },
  image:              { type: DataTypes.STRING, allowNull: true }, // path: product_images/xxx.jpg
}, { tableName: 'category_product' });

/* ---------- Product ---------- */
const Product = sequelize.define('Product', {
  name:      { type: DataTypes.STRING(100), allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true },
  price:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image:     { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'product' });

// ForeignKey(CategoryProduct, CASCADE, related_name='products')
CategoryProduct.hasMany(Product, { foreignKey: { name: 'category_id', allowNull: false }, onDelete: 'CASCADE', as: 'products' });
Product.belongsTo(CategoryProduct, { foreignKey: 'category_id', as: 'category' });

// gambar_tambahan: satu produk bisa punya banyak MediaFile
Product.belongsToMany(MediaFile, { through: 'product_media', as: 'gambar_tambahan', foreignKey: 'product_id', otherKey: 'media_file_id' });
MediaFile.belongsToMany(Product, { through: 'product_media', as: 'products', foreignKey: 'media_file_id', otherKey: 'product_id' });

module.exports = {
  sequelize, User, UserCostumer, UserAdmin,
  MediaFile, CategoryProduct, Product,
};