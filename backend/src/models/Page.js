const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

// Flexible content block for pages like Home / About that are mostly
// hero image + writeup, without needing a full page-builder.
const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  slug: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true, // e.g. 'home', 'about'
  },
  title: DataTypes.STRING,
  heroImageUrl: DataTypes.STRING,
  bodyText: DataTypes.TEXT,
}, {
  tableName: 'pages',
});

module.exports = Page;
