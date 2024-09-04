const mongoose = require('mongoose');
const TrousseauSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        permissions: {type: String, enum: ['read', 'edit'], default: 'read'},
        invitation: { type: String, enum: ['pending', 'accepted', 'refused'], default: 'pending'}}],
    isShared: { type: Boolean, default: false}
});
module.exports=mongoose.model('Trousseau', TrousseauSchema);