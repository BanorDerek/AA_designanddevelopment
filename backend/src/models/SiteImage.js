const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

// Covers any image slot the admin should be able to swap — hero images,
// the "Our Work" gallery row, About page portrait, etc. — without needing
// a dedicated DB column for every single image on the site.
// `key` is a stable slug the frontend references, e.g. 'home-hero',
// 'home-gallery-1', 'about-portrait'.
const SiteImage = sequelize.define('SiteImage', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  key: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'site_images',
});

module.exports = SiteImage;
