const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: String,
  author: String,
  content: String,
  time: String,
});

module.exports=mongoose.model('message', messageSchema);