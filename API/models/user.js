const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, // Identifiant automatiquement généré
    email: { type: String, unique: true }, // E-mail unique
    pseudo: { type: String, unique: true }, // Pseudo unique
    password: { type: String,}
});
module.exports=mongoose.model('User', UserSchema);