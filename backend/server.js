
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

// تكوين CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// تكوين حد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد الطلبات لكل IP
});
app.use(limiter);

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files and uploads
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Models
const Message = require('./models/Message');
const User = require('./models/User');
const Novel = require('./models/Novel');
const Notification = require('./models/Notification');

// Routes
const novelsRouter = require('./routes/novels');
const chaptersRouter = require('./routes/chapters');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const reportsRouter = require('./routes/reports');
const notificationsRouter = require('./routes/notifications');

app.use('/api/novels', novelsRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);

// Serve admin panel
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected, socket ID:', socket.id);

  socket.on('get initial messages', async () => {
    try {
      const messages = await Message.find().sort('-createdAt').limit(100).populate('user', 'name');
      console.log('Sending initial messages');
      socket.emit('initial messages', messages.reverse());
    } catch (err) {
      console.error('Error fetching initial messages:', err);
    }
  });

  socket.on('chat message', async (msg, callback) => {
    console.log('Received message:', msg);
    try {
      const user = await User.findById(msg.userId);
      if (!user) {
        throw new Error('User not found');
      }
  
      const newMessage = new Message({
        user: user._id,
        text: msg.text,
        replyTo: msg.replyTo
      });
  
      await newMessage.save();
      const populatedMessage = await Message.findById(newMessage._id).populate('user', 'name');
  
      // حذف الرسائل القديمة إذا تجاوز العدد 100
      const messagesCount = await Message.countDocuments();
      if (messagesCount > 100) {
        const oldestMessages = await Message.find().sort('createdAt').limit(messagesCount - 100);
        await Message.deleteMany({ _id: { $in: oldestMessages.map(m => m._id) } });
      }
  
      console.log('Emitting new message to all clients');
      io.emit('chat message', populatedMessage);
  
      // التحقق من الإشارات وإنشاء الإشعارات
      const mentionedUsers = msg.text.match(/@(\w+)/g);
      if (mentionedUsers) {
        for (const mention of mentionedUsers) {
          const username = mention.slice(1);
          const mentionedUser = await User.findOne({ name: username });
          if (mentionedUser) {
            const notification = await Notification.create({
              userId: mentionedUser._id,
              messageId: populatedMessage._id
            });
            io.to(mentionedUser._id.toString()).emit('new notification', notification);
          }
        }
      }
  
      if (msg.replyTo) {
        const originalMessage = await Message.findById(msg.replyTo).populate('user', 'name');
        if (originalMessage && originalMessage.user) {
          io.to(originalMessage.user._id.toString()).emit('new reply', {
            from: user.name,
            text: msg.text
          });
        }
      }
  
      if (callback) callback(null, populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      if (callback) callback(error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected, socket ID:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
