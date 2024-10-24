
const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const schedule = require('node-schedule');

// تكوين التخزين لملفات الفصول
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads', 'chapters');
        await fs.ensureDir(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// الحصول على جميع فصول رواية معينة
router.get('/:novelId', async (req, res) => {
    try {
        const chapters = await Chapter.find({ 
            novelId: req.params.novelId,
            isPublished: true,
            publishDate: { $lte: new Date() }
        }).sort('number');
        res.json(chapters);
    } catch (err) {
        console.error('Error fetching chapters:', err);
        res.status(500).json({ message: err.message });
    }
});

// الحصول على تفاصيل الفصل وزيادة عدد المشاهدات
router.get('/:novelId/:chapterNumber', async (req, res) => {
    try {
      const chapter = await Chapter.findOneAndUpdate(
        { novelId: req.params.novelId, number: parseInt(req.params.chapterNumber) },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      res.json(chapter);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
// إضافة فصول مع النشر الفوري
router.post('/:novelId', upload.array('chapters'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const novelId = req.params.novelId;
    const uploadedChapters = [];

    try {
        for (const file of req.files) {
            const chapterNumber = parseInt(path.parse(file.originalname).name);
            let content;
            try {
                content = await fs.readFile(file.path, 'utf8');
            } catch (err) {
                console.error(`Error reading file ${file.path}:`, err);
                return res.status(500).json({ message: `Error reading file: ${err.message}` });
            }

            const wordCount = countWords(content);

            const chapter = new Chapter({
                novelId: novelId,
                number: chapterNumber,
                title: `الفصل ${chapterNumber}`,
                content: content,
                wordCount: wordCount,
                uploadDate: new Date(),
                publishDate: new Date(),
                isPublished: true,
                views: 0
            });

            const newChapter = await chapter.save();
            uploadedChapters.push(newChapter);

            // حذف الملف المؤقت بعد المعالجة
            await fs.remove(file.path);
        }

        // تحديث عدد الفصول المنشورة في الرواية
        await Novel.findByIdAndUpdate(novelId, { 
            $inc: { publishedChapters: uploadedChapters.length },
            $set: { lastUpdated: new Date() }
        });

        res.status(201).json(uploadedChapters);
    } catch (err) {
        console.error('Error uploading chapters:', err);
        res.status(500).json({ message: 'An error occurred while uploading chapters', error: err.message });
    }
});

// جدولة دفعة واحدة من الفصول
router.post('/:novelId/schedule', upload.array('chapters'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const novelId = req.params.novelId;
    const publishDate = new Date(req.body.publishDate);
    const uploadedChapters = [];

    for (const file of req.files) {
        const chapterNumber = parseInt(path.parse(file.originalname).name);
        let content;
        try {
            content = await fs.readFile(file.path, 'utf8');
        } catch (err) {
            console.error(`Error reading file ${file.path}:`, err);
            return res.status(500).json({ message: `Error reading file: ${err.message}` });
        }

        const chapter = new Chapter({
            novelId: novelId,
            number: chapterNumber,
            title: `الفصل ${chapterNumber}`,
            content: content,
            uploadDate: new Date(),
            publishDate: publishDate,
            isPublished: false
        });

        try {
            const newChapter = await chapter.save();
            uploadedChapters.push(newChapter);

            schedule.scheduleJob(publishDate, async function() {
                await Chapter.findByIdAndUpdate(newChapter._id, { isPublished: true });
                console.log(`Chapter ${chapterNumber} published successfully.`);
                
                // تحديث عدد الفصول المنشورة للرواية
                await Novel.findByIdAndUpdate(novelId, { $inc: { publishedChapters: 1 } });
            });
        } catch (err) {
            console.error(`Error saving chapter ${chapterNumber}:`, err);
            return res.status(400).json({ message: err.message });
        }
    }

    res.status(201).json(uploadedChapters);
});

// جدولة دفعات متعددة من الفصول
router.post('/:novelId/schedule-multiple', upload.array('chapters'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const novelId = req.params.novelId;
    const batchCount = parseInt(req.body.batchCount);
    const chaptersPerBatch = parseInt(req.body.chaptersPerBatch);
    const batchInterval = parseInt(req.body.batchInterval);

    const uploadedChapters = [];
    const now = new Date();

    for (let i = 0; i < Math.min(req.files.length, batchCount * chaptersPerBatch); i++) {
        const file = req.files[i];
        const chapterNumber = parseInt(path.parse(file.originalname).name);
        const batchIndex = Math.floor(i / chaptersPerBatch);
        const publishDate = new Date(now.getTime() + batchIndex * batchInterval * 60 * 60 * 1000);

        let content;
        try {
            content = await fs.readFile(file.path, 'utf8');
        } catch (err) {
            console.error(`Error reading file ${file.path}:`, err);
            return res.status(500).json({ message: `Error reading file: ${err.message}` });
        }

        const chapter = new Chapter({
            novelId: novelId,
            number: chapterNumber,
            title: `الفصل ${chapterNumber}`,
            content: content,
            uploadDate: new Date(),
            publishDate: publishDate,
            isPublished: false
        });

        try {
            const newChapter = await chapter.save();
            uploadedChapters.push(newChapter);

            schedule.scheduleJob(publishDate, async function() {
                await Chapter.findByIdAndUpdate(newChapter._id, { isPublished: true });
                console.log(`Chapter ${chapterNumber} published successfully.`);
                
                // تحديث عدد الفصول المنشورة للرواية
                await Novel.findByIdAndUpdate(novelId, { $inc: { publishedChapters: 1 } });
            });
        } catch (err) {
            console.error(`Error saving chapter ${chapterNumber}:`, err);
            return res.status(400).json({ message: err.message });
        }
    }

    res.status(201).json(uploadedChapters);
});

// حذف فصل
router.delete('/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        const novel = await Novel.findById(chapter.novelId);
        if (!novel) {
            return res.status(404).json({ message: 'Novel not found' });
        }

        await Chapter.deleteOne({ _id: req.params.id });

        if (chapter.isPublished) {
            novel.publishedChapters = Math.max(0, novel.publishedChapters - 1);
            await novel.save();
        }

        res.json({ message: 'Chapter deleted successfully' });
    } catch (err) {
        console.error('Error deleting chapter:', err);
        res.status(500).json({ message: err.message });
    }
});

// إعادة جدولة نشر فصل
router.patch('/:chapterId/reschedule', async (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const newPublishDate = new Date(req.body.newPublishDate);

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        if (chapter.isPublished) {
            return res.status(400).json({ message: 'Cannot reschedule a published chapter' });
        }

        const oldJob = schedule.scheduledJobs[chapterId];
        if (oldJob) {
            oldJob.cancel();
        }

        chapter.publishDate = newPublishDate;
        await chapter.save();

        schedule.scheduleJob(chapterId, newPublishDate, async function() {
            await Chapter.findByIdAndUpdate(chapterId, { isPublished: true });
            console.log(`Chapter ${chapter.number} published successfully.`);
            
            // تحديث عدد الفصول المنشورة للرواية
            await Novel.findByIdAndUpdate(chapter.novelId, { $inc: { publishedChapters: 1 } });
        });

        res.json({ message: 'Chapter rescheduled successfully', newPublishDate });
    } catch (error) {
        console.error('Error rescheduling chapter:', error);
        res.status(500).json({ message: 'An error occurred while rescheduling the chapter' });
    }
});

// البحث عن فصل برقم معين
router.get('/search/:novelId/:number', async (req, res) => {
    try {
        const chapter = await Chapter.findOne({ 
            novelId: req.params.novelId, 
            number: req.params.number,
            isPublished: true,
            publishDate: { $lte: new Date() }
        });
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        res.json(chapter);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function countWords(text) {
    // تنظيف النص من الأحرف الخاصة والأرقام
    const cleanText = text.replace(/[^\p{L}\s]/gu, '');
    // تقسيم النص إلى كلمات وعد الكلمات غير الفارغة
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

module.exports = router;
