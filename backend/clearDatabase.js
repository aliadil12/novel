










// backend/clearDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

const Novel = require('./models/Novel');
const Category = require('./models/Category');
const Chapter = require('./models/Chapter');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

async function clearDatabase() {
  try {
    await Novel.deleteMany({});
    await Category.deleteMany({});
    await Chapter.deleteMany({});
    console.log('All data has been deleted from the database');
  } catch (error) {
    console.error('Error clearing the database:', error);
  } finally {
    mongoose.connection.close();
  }
}

clearDatabase();










