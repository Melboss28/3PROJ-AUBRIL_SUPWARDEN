const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: String,
  author: String,
  content: String,
  time: String,
  recipient: String
});

module.exports = mongoose.model('Message', MessageSchema);
