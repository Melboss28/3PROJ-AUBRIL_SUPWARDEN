const express = require('express');
const mongoose = require('mongoose');
const Element = require('../models/element');
const Trousseau = require('../models/trousseau');
const authMiddleware = require('../JWT/authMiddleware');
const upload = require('../upload');
const { getGFS } = require('../gfsSetup'); // Importer depuis gfsSetup.js
const router = express.Router();

router.get('/file/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const gfs = await getGFS();
        const file = await gfs.collection('uploads').findOne({ filename });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readstream = gfs.createReadStream({
            filename: file.filename
        });

        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching file' });
    }
});

router.use(authMiddleware); // Apply authentication middleware

// Route pour obtenir les éléments d'un trousseau spécifique
router.get('/trousseau/:trousseauId', async (req, res) => {
    const { trousseauId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(trousseauId)) {
        return res.status(400).json({ message: 'Invalid Trousseau ID' });
    }

    try {
        const trousseau = await Trousseau.findById(trousseauId).populate('owner members.user');
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau not found' });
        }

        const elements = await Element.find({ trousseau: trousseauId });
        res.status(200).json(elements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour ajouter un nouvel élément à un trousseau
router.post('/trousseau/:trousseauId', upload.single('file'), async (req, res) => {
    const { trousseauId } = req.params;
    const { name, username, password, uris, note, customFields, isSensitive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trousseauId)) {
        return res.status(400).json({ message: 'Invalid Trousseau ID' });
    }

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau not found' });
        }

        // Gestion des fichiers attachés
        const attachments = req.file ? [{ filename: req.file.filename, fileId: req.file.id }] : [];

        const newElement = new Element({
            _id: new mongoose.Types.ObjectId(),
            name,
            username,
            password,
            uris: uris ? JSON.parse(uris) : [],
            note,
            customFields: customFields ? JSON.parse(customFields) : [],
            attachments,
            isSensitive,
            trousseau: trousseauId,
            permissions: []
        });

        const savedElement = await newElement.save();
        res.status(201).json(savedElement);
    } catch (error) {
        console.error('Error adding element:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route pour supprimer un élément
router.delete('/:elementId', async (req, res) => {
    const { elementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ message: 'Invalid Element ID' });
    }

    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ message: 'Element not found' });
        }

        // Suppression des fichiers attachés de GridFS
        const gfs = await getGFS();
        if (element.attachments && element.attachments.length > 0) {
            const fileIds = element.attachments.map(att => att.fileId);
            for (const fileId of fileIds) {
                await gfs.collection('uploads').deleteOne({ _id: new mongoose.Types.ObjectId(fileId) });
            }
        }

        await Element.findByIdAndDelete(elementId);
        res.status(200).json({ message: 'Element deleted successfully' });
    } catch (error) {
        console.error('Error deleting element:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route pour obtenir un élément spécifique
router.get('/:elementId', async (req, res) => {
    const { elementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ message: 'Invalid Element ID' });
    }

    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ message: 'Element not found' });
        }

        res.status(200).json(element);
    } catch (error) {
        console.error('Error fetching element:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route pour mettre à jour un élément avec un fichier
router.put('/:elementId', async (req, res) => {
    const { elementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ message: 'Invalid Element ID' });
    }

    try {
        const { attachments, ...updateData } = req.body; // Exclude `attachments` from the update

        const updatedElement = await Element.findByIdAndUpdate(
            elementId,
            { $set: updateData }, // Update only the fields provided in `updateData`
            { new: true, runValidators: true } // Options to return the updated document and run validators
        );

        if (!updatedElement) {
            return res.status(404).json({ message: 'Element not found' });
        }

        res.status(200).json(updatedElement);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating element' });
    }
});

// Route pour ajouter une pièce jointe à un élément
router.post('/:elementId/attachments', upload.single('file'), async (req, res) => {
    const { elementId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ message: 'Invalid Element ID' });
    }
    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ message: 'Element not found' });
        }

        const attachment = { filename: req.file.filename, fileId: req.file.id };
        element.attachments.push(attachment);
        await element.save();

        res.status(201).json(element);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding attachment' });
    }
});

// Route pour supprimer une pièce jointe d'un élément
router.delete('/:elementId/attachments/:attachmentId', async (req, res) => {
    const { elementId, attachmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ message: 'Invalid Element ID' });
    }
    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ message: 'Element not found' });
        }

        const attachmentIndex = element.attachments.findIndex(att => att._id.toString() === attachmentId);
        if (attachmentIndex === -1) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        const [attachment] = element.attachments.splice(attachmentIndex, 1);
        await element.save();

        // Optionally, remove the file from storage
        const gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        gridFSBucket.delete(new mongoose.Types.ObjectId(attachment.fileId), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting file from GridFS' });
            }
        });

        res.status(200).json(element);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing attachment' });
    }
});


module.exports = router;