
const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'covers'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Get all novels
router.get('/', async (req, res) => {
  try {
    const novels = await Novel.find();
    console.log('Fetched novels from database:', novels);
    res.json(novels);
  } catch (err) {
    console.error('Error fetching novels:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new novel
router.post('/', upload.single('cover'), async (req, res) => {
  console.log('Received POST request to add novel');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  try {
    const novel = new Novel({
      title: req.body.title,
      description: req.body.description,
      cover: req.file ? `/uploads/covers/${req.file.filename}` : null,
      categories: Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(','),
      completionStatus: req.body.completionStatus,
      supporters: req.body.supporters ? req.body.supporters.split(',') : [],
      section: req.body.section
    });

    const newNovel = await novel.save();
    console.log('Novel saved successfully:', newNovel);
    res.status(201).json(newNovel);
  } catch (err) {
    console.error('Error saving novel:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'A novel with this title already exists.' });
    } else {
      res.status(500).json({ message: 'An error occurred while saving the novel.', error: err.message });
    }
  }
});

// Get a specific novel by slug and increment views
router.get('/:slug', async (req, res) => {
  try {
    const novel = await Novel.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }
    res.json(novel);
  } catch (err) {
    console.error('Error fetching novel:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update a novel
router.patch('/:slug', upload.single('cover'), async (req, res) => {
  try {
    const novel = await Novel.findOne({ slug: req.params.slug });
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    if (req.body.title) novel.title = req.body.title;
    if (req.body.description) novel.description = req.body.description;
    if (req.file) novel.cover = `/uploads/covers/${req.file.filename}`;
    if (req.body.categories) novel.categories = Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',');
    if (req.body.completionStatus) novel.completionStatus = req.body.completionStatus;
    if (req.body.supporters) novel.supporters = req.body.supporters.split(',');
    if (req.body.section) novel.section = req.body.section;

    const updatedNovel = await novel.save();
    res.json(updatedNovel);
  } catch (err) {
    console.error('Error updating novel:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a novel
router.delete('/:slug', async (req, res) => {
  try {
    const novel = await Novel.findOne({ slug: req.params.slug });
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    await Chapter.deleteMany({ novelId: novel._id });

    if (novel.cover) {
      const coverPath = path.join(__dirname, '..', 'public', novel.cover);
      try {
        await fs.unlink(coverPath);
      } catch (err) {
        console.error('Error deleting cover file:', err);
      }
    }

    await novel.deleteOne();

    res.json({ message: 'تم حذف الرواية وجميع فصولها بنجاح' });
  } catch (err) {
    console.error('Error deleting novel:', err);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء حذف الرواية', 
      error: err.message 
    });
  }
});

module.exports = router;
