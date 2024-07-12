import Berita from '../models/Berita.js';
import User from '../models/User.js';

export const addBerita = async (req, res) => {
  const { title, paragraf, adminId } = req.body;
  const gambar = req.file.filename;

  try {
    const user = await User.findByPk(adminId);
    if (!user) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    const berita = await Berita.create({
      gambar,
      title,
      paragraf,
      adminId,
    });

    res.status(201).json(berita);
  } catch (err) {
    console.error('Error adding berita:', err.message);
    res.status(500).send('Server error');
  }
};

export const getAllBerita = async (req, res) => {
  try {
    const beritaList = await Berita.findAll();
    res.json(beritaList);
  } catch (err) {
    console.error('Error getting berita:', err.message);
    res.status(500).send('Server error');
  }
};

export const getBeritaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const berita = await Berita.findByPk(id);
    if (!berita) {
      return res.status(404).json({ msg: 'Berita not found' });
    }

    res.json(berita);
  } catch (err) {
    console.error('Error getting berita:', err.message);
    res.status(500).send('Server error');
  }
};
