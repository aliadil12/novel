
const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  publishDate: { type: Date },
  isPublished: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Chapter', ChapterSchema);






