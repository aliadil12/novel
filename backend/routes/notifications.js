
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// الحصول على الإشعارات غير المقروءة للمستخدم الحالي
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const unreadNotifications = await Notification.find({ userId: req.user._id, read: false })
      .sort('-createdAt')
      .populate('messageId');
    res.json(unreadNotifications);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الإشعارات غير المقروءة' });
  }
});

// تحديث حالة الإشعارات إلى مقروءة
router.post('/mark-as-read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'تم تحديث جميع الإشعارات إلى مقروءة' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الإشعارات' });
  }
});

module.exports = router;
