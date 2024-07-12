import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Berita from '../models/Berita.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Mengatur storage engine untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); //public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/berita', verifyToken, upload.single('gambar'), async (req, res) => {
  try {
    const { title, paragraf } = req.body;
    const { id: adminId } = req.user;
    const gambar = req.file.filename;

    const berita = await Berita.create({ gambar, title, paragraf, adminId });
    res.json(berita);
  } catch (err) {
    console.error('Error creating berita:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

router.get('/berita', async (req, res) => {
  try {
    const { adminId } = req.query; // Ambil adminId dari query string

    // Tambahkan kondisi where untuk filter berdasarkan adminId
    const beritaList = await Berita.findAll({
      where: { adminId },
    });

    // Ubah URL gambar menjadi URL lengkap dengan protokol dan host
    const updatedBeritaList = beritaList.map((berita) => {
      const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/${berita.gambar}`;
      return { ...berita.dataValues, gambar: fullImageUrl };
    });

    res.json(updatedBeritaList);
  } catch (err) {
    console.error('Terjadi kesalahan saat mengambil berita:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

// DELETE berita by ID
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params; // Ambil ID berita dari parameter URL
  const { id: adminId } = req.user; // Ambil adminId dari token yang sudah diverifikasi

  try {
    // Cari berita berdasarkan id dan adminId
    const berita = await Berita.findOne({
      where: {
        id,
        adminId,
      },
    });

    if (!berita) {
      return res.status(404).json({ msg: 'Berita not found' });
    }

    const gambarPath = path.join('public/uploads', berita.gambar);

    // Hapus berita dari database
    await berita.destroy();

    // Hapus file gambar dari direktori lokal
    fs.unlink(gambarPath, (err) => {
      if (err) {
        console.error('Error deleting image file:', err.message);
        return res.status(500).send('server eror->periksa log eror');
      }

      res.json({ msg: 'Berita and associated image deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting berita:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

// PUT update berita by ID
router.put('/:id', verifyToken, upload.single('gambar'), async (req, res) => {
  const { id } = req.params; // Ambil ID berita dari parameter URL
  const { title, paragraf } = req.body;
  const { id: adminId } = req.user; // Ambil adminId dari token yang sudah diverifikasi
  const gambar = req.file ? req.file.filename : null;

  try {
    // Cari berita berdasarkan id dan adminId
    const berita = await Berita.findOne({
      where: {
        id,
        adminId,
      },
    });

    if (!berita) {
      return res.status(404).json({ msg: 'Berita not found' });
    }

    // Hapus gambar lama jika ada gambar baru
    if (gambar && berita.gambar) {
      const oldGambarPath = path.join('public/uploads', berita.gambar);
      fs.unlink(oldGambarPath, (err) => {
        if (err) {
          console.error('Error deleting old image file:', err.message);
        }
      });
    }

    // Update berita
    await Berita.update(
      {
        title: title || berita.title,
        paragraf: paragraf || berita.paragraf,
        gambar: gambar || berita.gambar,
      },
      { where: { id, adminId } }
    );

    res.json({ msg: 'Berita updated successfully' });
  } catch (err) {
    console.error('Error updating berita:', err.message);
    res.status(500).send('server eror->periksa log eror');
  }
});

export default router;
