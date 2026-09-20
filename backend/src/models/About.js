const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const About = sequelize.define('About', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'About',
  },
  heroImageKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sections: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  team: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  teamTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Our Team',
  },
  // Use coreValues instead of values
  coreValues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  valuesTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Our Values',
  },
  metaDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'about',
});

module.exports = About;