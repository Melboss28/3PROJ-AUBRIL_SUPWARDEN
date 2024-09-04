const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration du stockage GridFS
const storage = new GridFsStorage({
    url: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongodb:27017/supwarden?authSource=admin`,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: 'uploads',
            filename: file.originalname,
        };
    },
    cache: false,
});

const upload = multer({ storage });

module.exports = upload;
