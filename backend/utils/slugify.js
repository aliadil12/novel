









const slugify = require('slugify');

function createSlug(text) {
  return slugify(text, {
    replacement: '-',  // استبدال المسافات بـ -
    remove: /[*+~.()'"!:@]/g, // إزالة بعض الرموز الخاصة
    lower: false, // عدم تحويل النص إلى أحرف صغيرة
    strict: true, // استبدال الأحرف غير المتوافقة
    locale: 'ar' // استخدام اللغة العربية
  });
}

module.exports = createSlug;









