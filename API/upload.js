const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');

// Configuration du stockage GridFS
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/supwarden',
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
