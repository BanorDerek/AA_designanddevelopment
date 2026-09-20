const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

// Single-row table — the admin dashboard edits the one existing record.
const SiteSettings = sequelize.define('SiteSettings', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  brandName: {
    type: DataTypes.STRING,
    defaultValue: 'AA Designs and Development',
  },
  tagline: DataTypes.STRING,
  contactEmail: DataTypes.STRING,
  instagramUrl: DataTypes.STRING,
  facebookUrl: DataTypes.STRING,
  tiktokUrl: DataTypes.STRING,
  footerText: DataTypes.TEXT,
}, {
  tableName: 'site_settings',
});

module.exports = SiteSettings;
