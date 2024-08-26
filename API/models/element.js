const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

const ElementSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String},
    username: { type: String},
    password: { type: String},
    uris: [{ type: String}],
    note: { type: String},
    customFields: [{
        name: { type: String},
        value: { type: String},
        type: {
            type: String,
            enum: ['text', 'password']
        }
    }],
    attachments:[AttachmentSchema],
    isSensitive: {type: Boolean, default: false},
    trousseau: {type: mongoose.Schema.Types.ObjectId, ref:'Trousseau'},
    permissions: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
        canEdit:{type: Boolean, default: false}
    }]
  });
  
module.exports=mongoose.model('Element', ElementSchema);