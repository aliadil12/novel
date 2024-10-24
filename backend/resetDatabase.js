


require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function resetDatabase() {
  try {
    await User.deleteMany({});
    console.log('تم حذف جميع المستخدمين');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'AdminPassword123!';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      name: 'المسؤول الرئيسي',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true
    });

    await adminUser.save();
    console.log('تم إنشاء حساب المسؤول الجديد بنجاح');
    console.log('البريد الإلكتروني:', adminEmail);
    console.log('كلمة المرور:', adminPassword);

    const savedUser = await User.findOne({ email: adminEmail });
    if (savedUser) {
      console.log('تم التحقق من وجود المستخدم في قاعدة البيانات');
      console.log('معرف المستخدم:', savedUser._id);
      console.log('هل المستخدم مسؤول؟', savedUser.isAdmin);
    } else {
      console.log('لم يتم العثور على المستخدم في قاعدة البيانات!');
    }
  } catch (error) {
    console.error('خطأ في إعادة ضبط قاعدة البيانات:', error);
  } finally {
    mongoose.disconnect();
  }
}

resetDatabase();






