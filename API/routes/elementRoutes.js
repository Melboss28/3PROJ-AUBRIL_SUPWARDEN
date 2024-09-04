const express = require('express');
const mongoose = require('mongoose');
const Element = require('../models/element');
const Trousseau = require('../models/trousseau');
const authMiddleware = require('../JWT/authMiddleware');
const upload = require('../upload');
const { getGFS } = require('../gfsSetup'); // Importer depuis gfsSetup.js
const router = express.Router();
require('dotenv').config();

// Route pour obtenir un fichier à partir de GridFS
/**
 * @swagger
 * /api/element/file/{filename}:
 *   get:
 *     summary: Obtenir un fichier
 *     description: Récupérer un fichier stocké dans GridFS par son nom de fichier.
 *     tags:
 *       - element
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         description: Nom du fichier à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fichier récupéré avec succès.
 *       404:
 *         description: Fichier non trouvé.
 *       500:
 *         description: Erreur lors de la récupération du fichier.
 */
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
/**
 * @swagger
 * /api/element/trousseau/{trousseauId}:
 *   get:
 *     summary: Obtenir les éléments d'un trousseau
 *     description: Récupérer tous les éléments associés à un trousseau spécifique.
 *     tags:
 *       - element
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID du trousseau
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des éléments du trousseau.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Element'
 *       400:
 *         description: ID du trousseau invalide.
 *       404:
 *         description: Trousseau non trouvé.
 *       500:
 *         description: Erreur lors de la récupération des éléments.
 */
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

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Route pour ajouter un nouvel élément à un trousseau
/**
 * @swagger
 * /api/element/trousseau/{trousseauId}:
 *   post:
 *     summary: Ajouter un nouvel élément à un trousseau
 *     description: Ajouter un élément à un trousseau spécifique avec la possibilité de joindre un fichier.
 *     tags:
 *       - element
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID du trousseau
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'élément
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur associé
 *               password:
 *                 type: string
 *                 description: Mot de passe (sera chiffré)
 *               uris:
 *                 type: string
 *                 description: Liste des URIs associées (au format JSON)
 *               note:
 *                 type: string
 *                 description: Note associée à l'élément
 *               customFields:
 *                 type: string
 *                 description: Champs personnalisés (au format JSON)
 *               isSensitive:
 *                 type: boolean
 *                 description: Indique si l'élément est sensible
 *       multipart/form-data:
 *         schema:
 *           type: object
 *           properties:
 *             file:
 *               type: string
 *               format: binary
 *     responses:
 *       201:
 *         description: Élément ajouté avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Element'
 *       400:
 *         description: ID du trousseau invalide ou données de l'élément manquantes.
 *       404:
 *         description: Trousseau non trouvé.
 *       500:
 *         description: Erreur lors de l'ajout de l'élément.
 */
router.post('/trousseau/:trousseauId', upload.single('file'), async (req, res) => {
    const { trousseauId } = req.params;
    const { name, username, password, uris, note, customFields, isSensitive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trousseauId)) {
        return res.status(400).json({ error: 'Invalid Trousseau ID' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Nom requis' });
    }

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ error: 'Trousseau not found' });
        }

        const encryptedPassword = password ? encrypt(password) : null;

        // Gestion des fichiers attachés
        const attachments = req.file ? [{ filename: req.file.filename, fileId: req.file.id }] : [];

        const newElement = new Element({
            _id: new mongoose.Types.ObjectId(),
            name,
            username,
            password: encryptedPassword,
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Route pour supprimer un élément
/**
 * @swagger
 * /api/element/{elementId}:
 *   delete:
 *     summary: Supprimer un élément
 *     description: Supprimer un élément spécifique et ses fichiers attachés.
 *     tags:
 *       - element
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: elementId
 *         in: path
 *         required: true
 *         description: ID de l'élément à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Élément supprimé avec succès.
 *       400:
 *         description: ID de l'élément invalide.
 *       404:
 *         description: Élément non trouvé.
 *       500:
 *         description: Erreur lors de la suppression de l'élément.
 */
router.delete('/:elementId', async (req, res) => {
    const { elementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(elementId)) {
        return res.status(400).json({ error: 'Invalid Element ID' });
    }

    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ error: 'Element not found' });
        }

        // Suppression des fichiers attachés
        const gfs = await getGFS();
        for (const attachment of element.attachments) {
            await gfs.collection('uploads').deleteOne({ _id: mongoose.Types.ObjectId(attachment.fileId) });
        }

        await element.remove();
        res.status(200).json({ message: 'Element deleted successfully' });
    } catch (error) {
        console.error('Error deleting element:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
