const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, unique: true },
    pseudo: { type: String, unique: true },
    password: { type: String,},
    googleId: { type: String, unique: true },
});
module.exports=mongoose.model('User', UserSchema);