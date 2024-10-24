
// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// الحصول على جميع البلاغات
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .populate('novel', 'title')
      .populate('chapter', 'number title')
      .sort('-createdAt');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب البلاغات', error: error.message });
  }
});

// إنشاء بلاغ جديد
router.post('/', async (req, res) => {
  try {
    const { novelId, chapterId, message, userId } = req.body;
    const report = new Report({
      user: userId,
      novel: novelId,
      chapter: chapterId,
      message
    });
    await report.save();
    res.status(201).json({ message: 'تم إرسال البلاغ بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال البلاغ', error: error.message });
  }
});

// تحديث حالة البلاغ
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'البلاغ غير موجود' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث البلاغ', error: error.message });
  }
});

module.exports = router;
