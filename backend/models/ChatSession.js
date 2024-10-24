

const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    messageCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);

