import Ekskul from '../models/Ekskul.js';
import User from '../models/User.js';

export const addEkskul = async (req, res) => {
  const { title, paragraf, adminId } = req.body;
  const gambar = req.file.filename;

  try {
    const user = await User.findByPk(adminId);
    if (!user) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    const ekskul = await Ekskul.create({
      gambar,
      title,
      paragraf,
      adminId,
    });

    res.status(201).json(ekskul);
  } catch (err) {
    console.error('Error adding ekskul:', err.message);
    res.status(500).send('Server error');
  }
};

export const getAllEkskul = async (req, res) => {
  try {
    const ekskulList = await Ekskul.findAll();
    res.json(ekskulList);
  } catch (err) {
    console.error('Error getting ekskul:', err.message);
    res.status(500).send('Server error');
  }
};

export const getEkskulById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const ekskul = await Ekskul.findByPk(id);
    if (!ekskul) {
      return res.status(404).json({ msg: 'ekskul not found' });
    }

    res.json(ekskul);
  } catch (err) {
    console.error('Error getting ekskul:', err.message);
    res.status(500).send('Server error');
  }
};
