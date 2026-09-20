const { Sequelize } = require('sequelize');
require('dotenv').config();

// Namecheap Stellar plans only expose MySQL (no Postgres), so we use the
// mysql2 dialect here. If you ever move to a host with Postgres, the only
// change needed is dialect: 'postgres' plus swapping the driver package.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      // MySQL on shared hosting defaults to utf8mb4 fine, but being explicit
      // avoids surprises with emoji/special characters in client copy.
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
