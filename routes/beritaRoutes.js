import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Berita from '../models/Berita.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST: Add news
router.post('/berita', verifyToken, upload.single('gambar'), async (req, res) => {
  try {
    const { title, paragraf } = req.body;
    const { id: adminId } = req.user;
    const gambar = req.file ? req.file.filename : null; // Allow gambar to be null

    const berita = await Berita.create({ gambar, title, paragraf, adminId });
    res.json(berita);
  } catch (err) {
    console.error('Error creating berita:', err.message);
    res.status(500).send('Server error - periksa log error');
  }
});

// GET: Retrieve all news
router.get('/berita', async (req, res) => {
  try {
    const { adminId } = req.query;
    const beritaList = await Berita.findAll({ where: { adminId } });
    
    const updatedBeritaList = beritaList.map((berita) => {
      const fullImageUrl = berita.gambar 
        ? `${req.protocol}://${req.get('host')}/uploads/${berita.gambar}` 
        : null; // Handle case where there is no image
      return { ...berita.dataValues, gambar: fullImageUrl };
    });

    res.json(updatedBeritaList);
  } catch (err) {
    console.error('Error fetching berita:', err.message);
    res.status(500).send('Server error - periksa log error');
  }
});

// DELETE: Delete news by ID
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { id: adminId } = req.user;

  try {
    const berita = await Berita.findOne({ where: { id, adminId } });
    if (!berita) {
      return res.status(404).json({ msg: 'Berita tidak ditemukan' });
    }

    const gambarPath = path.join('public/uploads', berita.gambar);
    await berita.destroy();
    if (berita.gambar) {
      fs.unlink(gambarPath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err.message);
          return res.status(500).send('Server error - periksa log error');
        }
      });
    }
    res.json({ msg: 'Berita dan gambar terkait berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting berita:', err.message);
    res.status(500).send('Server error - periksa log error');
  }
});

// PUT: Update news by ID
router.put('/:id', verifyToken, upload.single('gambar'), async (req, res) => {
  const { id } = req.params;
  const { title, paragraf } = req.body;
  const { id: adminId } = req.user;
  const gambar = req.file ? req.file.filename : null; // Allow gambar to be null

  try {
    const berita = await Berita.findOne({ where: { id, adminId } });
    if (!berita) {
      return res.status(404).json({ msg: 'Berita tidak ditemukan' });
    }

    // Delete old image if a new one is uploaded
    if (gambar && berita.gambar) {
      const oldGambarPath = path.join('public/uploads', berita.gambar);
      fs.unlink(oldGambarPath, (err) => {
        if (err) {
          console.error('Error deleting old image file:', err.message);
        }
      });
    }

    await Berita.update(
      {
        title: title || berita.title,
        paragraf: paragraf || berita.paragraf,
        gambar: gambar || berita.gambar,
      },
      { where: { id, adminId } }
    );

    res.json({ msg: 'Berita berhasil diperbarui' });
  } catch (err) {
    console.error('Error updating berita:', err.message);
    res.status(500).send('Server error - periksa log error');
  }
});

export default router;
