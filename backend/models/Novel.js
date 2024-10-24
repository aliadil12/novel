

const mongoose = require('mongoose');
const slugify = require('slugify');

const NovelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  cover: { type: String, required: true },
  categories: [{ type: String }],
  completionStatus: { type: String, enum: ['مكتملة', 'جارية'], required: true },
  totalChapters: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  supporters: [{ type: String }],
  section: { type: String, required: true },
  publishedChapters: { type: Number, default: 0 }
}, { 
  timestamps: true,
  _id: true,
  id: false
});

NovelSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true, locale: 'ar' });
  }
  next();
});

module.exports = mongoose.model('Novel', NovelSchema);









