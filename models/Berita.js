// models/Berita.js
import { DataTypes } from 'sequelize';
import db from '../db.js';
import User from './User.js';

const Berita = db.define('Berita', {
  gambar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paragraf: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  adminId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: true,
});

User.hasMany(Berita, { foreignKey: 'adminId' });
Berita.belongsTo(User, { foreignKey: 'adminId' });

export default Berita;
