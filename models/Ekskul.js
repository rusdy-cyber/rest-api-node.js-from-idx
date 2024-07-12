// models/Ekskul.js
import { DataTypes } from 'sequelize';
import db from '../db.js';
import User from './User.js';

const Ekskul = db.define('Ekskul', {
  gambar: {
    type: DataTypes.STRING,
    allowNull: false,
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

User.hasMany(Ekskul, { foreignKey: 'adminId' });
Ekskul.belongsTo(User, { foreignKey: 'adminId' });

export default Ekskul;
