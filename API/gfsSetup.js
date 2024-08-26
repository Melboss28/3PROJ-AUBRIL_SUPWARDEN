const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const conn = mongoose.connection;
let gfs;

const initializeGFS = new Promise((resolve, reject) => {
    conn.once('open', () => {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');
        console.log('GridFS initialized');
        resolve();
    });
    conn.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        reject(error);
    });
});

const getGFS = async () => {
    await initializeGFS;
    if (!gfs || !gfs.collection) {
        throw new Error('GridFS is not initialized');
    }
    return gfs;
};

module.exports = { getGFS, initializeGFS };
