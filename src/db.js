require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const pakaiSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'foura_creative',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    define: { underscored: true }, // created_at, updated_at, category_id (gaya Django)
    dialectOptions: pakaiSSL
      ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
      : {},
    pool: { max: 3, min: 0, idle: 10000, acquire: 30000 },
  }
);

module.exports = sequelize;
