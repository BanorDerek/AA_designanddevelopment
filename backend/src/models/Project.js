const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  description: DataTypes.TEXT,
  coverImageUrl: DataTypes.STRING,
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'projects',
});

const ProjectImage = sequelize.define('ProjectImage', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  caption: DataTypes.STRING,
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'project_images',
});

Project.hasMany(ProjectImage, { foreignKey: 'projectId', as: 'images', onDelete: 'CASCADE' });
ProjectImage.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = { Project, ProjectImage };
