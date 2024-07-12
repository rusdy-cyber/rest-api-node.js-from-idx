import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Ekskul from '../models/Ekskul.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Mengatur storage engine untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/', verifyToken, upload.single('gambar'), async (req, res) => {
  try {
    const { title, paragraf } = req.body;
    const { id: adminId } = req.user;
    const gambar = req.file.filename;

    const ekskul = await Ekskul.create({ gambar, title, paragraf, adminId });
    res.json(ekskul);
  } catch (err) {
    console.error('Error creating ekskul:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

router.get('/', async (req, res) => {
  try {
    const { adminId } = req.query; // Ambil adminId dari query string

    // Tambahkan kondisi where untuk filter berdasarkan adminId
    const ekskulList = await Ekskul.findAll({
      where: { adminId },
    });

    // Ubah URL gambar menjadi URL lengkap dengan protokol dan host
    const updatedekskulList = ekskulList.map((ekskul) => {
      const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/${ekskul.gambar}`;
      return { ...ekskul.dataValues, gambar: fullImageUrl };
    });

    res.json(updatedekskulList);
  } catch (err) {
    console.error('Terjadi kesalahan saat mengambil ekskul:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

// DELETE ekskul by ID
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params; // Ambil ID ekskul dari parameter URL
  const { id: adminId } = req.user; // Ambil adminId dari token yang sudah diverifikasi

  try {
    // Cari ekskul berdasarkan id dan adminId
    const ekskul = await Ekskul.findOne({
      where: {
        id,
        adminId,
      },
    });

    if (!ekskul) {
      return res.status(404).json({ msg: 'ekskul not found' });
    }

    const gambarPath = path.join('public/uploads', ekskul.gambar);

    // Hapus ekskul dari database
    await ekskul.destroy();

    // Hapus file gambar dari direktori lokal
    fs.unlink(gambarPath, (err) => {
      if (err) {
        console.error('Error deleting image file:', err.message);
        return res.status(500).send('server eror->periksa log eror');
      }

      res.json({ msg: 'ekskul and associated image deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting ekskul:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

// PUT update ekskul by ID
router.put('/:id', verifyToken, upload.single('gambar'), async (req, res) => {
  const { id } = req.params; // Ambil ID ekskul dari parameter URL
  const { title, paragraf } = req.body;
  const { id: adminId } = req.user; // Ambil adminId dari token yang sudah diverifikasi
  const gambar = req.file ? req.file.filename : null;

  try {
    // Cari ekskul berdasarkan id dan adminId
    const ekskul = await Ekskul.findOne({
      where: {
        id,
        adminId,
      },
    });

    if (!ekskul) {
      return res.status(404).json({ msg: 'ekskul not found' });
    }

    // Hapus gambar lama jika ada gambar baru
    if (gambar && ekskul.gambar) {
      const oldGambarPath = path.join('public/uploads', ekskul.gambar);
      fs.unlink(oldGambarPath, (err) => {
        if (err) {
          console.error('Error deleting old image file:', err.message);
        }
      });
    }

    // Update ekskul
    await Ekskul.update(
      {
        title: title || ekskul.title,
        paragraf: paragraf || ekskul.paragraf,
        gambar: gambar || ekskul.gambar,
      },
      { where: { id, adminId } }
    );

    res.json({ msg: 'ekskul updated successfully' });
  } catch (err) {
    console.error('Error updating ekskul:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

export default router;
