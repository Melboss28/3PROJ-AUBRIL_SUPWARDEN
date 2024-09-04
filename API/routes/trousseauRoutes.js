const mongoose = require('mongoose');
const express = require('express');
const Trousseau = require('../models/trousseau');
const User = require('../models/user');
const authMiddleware = require('../JWT/authMiddleware');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const json2csv = require('json2csv').parse;
const Element = require('../models/element');

router.use(authMiddleware); // Apply authentication middleware

// Route to create a new trousseau
/**
 * @swagger
 * /api/trousseau/create:
 *   post:
 *     summary: Create a new trousseau
 *     description: Create a new trousseau (vault) with a name, members, and sharing options.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     security:
 *       - bearerAuth: []
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
 *                 description: Name of the trousseau
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     invitation:
 *                       type: string
 *                     permissions:
 *                       type: string
 *               isShared:
 *                 type: boolean
 *                 description: Indicates if the trousseau is shared
 *     responses:
 *       201:
 *         description: Trousseau created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Server error.
 */
router.post('/create', async (req, res) => {
    const { name, members, isShared } = req.body;
    const owner = req.user.userId;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const trousseau = new Trousseau({
            _id: new mongoose.Types.ObjectId(),
            name,
            owner,
            members,
            isShared,
        });

        await trousseau.save();
        res.status(201).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get all trousseaux owned by the user
/**
 * @swagger
 * /api/trousseau/my-trousseaux:
 *   get:
 *     summary: Get all trousseaux owned by the user
 *     description: Retrieve all trousseaux created by the authenticated user.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trousseaux owned by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trousseau'
 *       500:
 *         description: Server error.
 */
router.get('/my-trousseaux', async(req, res) => {
    try {
        const trousseaux = await Trousseau.find({ owner: req.user.userId });
        res.status(200).json(trousseaux);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get trousseaux shared with the user
/**
 * @swagger
 * /api/trousseau/shared-with-me:
 *   get:
 *     summary: Get trousseaux shared with the user
 *     description: Retrieve trousseaux that are shared with the authenticated user.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trousseaux shared with the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   owner:
 *                     type: string
 *                   isShared:
 *                     type: boolean
 *                   invitation:
 *                     type: string
 *                   permission:
 *                     type: string
 *       500:
 *         description: Server error.
 */
router.get('/shared-with-me', async(req, res) => {
    try {
        const trousseaux = await Trousseau.find({ 'members.user': req.user.userId });
        const filteredTrousseaux = trousseaux.map(trousseau => {
            const member = trousseau.members.find(m => m.user.toString() === req.user.userId.toString());
            return {
                ...trousseau.toObject(),
                invitation: member.invitation,
                permission: member.permissions
            };
        });
        res.status(200).json(filteredTrousseaux);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to accept an invitation to a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}/accept-invitation:
 *   post:
 *     summary: Accept an invitation to a trousseau
 *     description: Accept an invitation to join a trousseau.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       404:
 *         description: Trousseau not found.
 *       403:
 *         description: User not a member of this trousseau.
 *       500:
 *         description: Server error.
 */
router.post('/:trousseauId/accept-invitation', async(req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId);

        if (!trousseau) {
            return res.status(404).json({ error: 'Trousseau not found' });
        }

        const member = trousseau.members.find(m => m.user.toString() === req.user.userId.toString());
        if (!member) {
            return res.status(403).json({ error: 'Not a member of this trousseau' });
        }

        member.invitation = 'accepted';

        await trousseau.save();
        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to refuse an invitation to a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId/refuse-invitation:
 *   post:
 *     summary: Refuse an invitation to a trousseau
 *     description: Refuse an invitation to join a trousseau.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation refused successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       404:
 *         description: Trousseau not found.
 *       403:
 *         description: User not a member of this trousseau.
 *       500:
 *         description: Server error.
 */
router.post('/:trousseauId/refuse-invitation', async(req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId);

        if (!trousseau) {
            return res.status(404).json({ error: 'Trousseau not found' });
        }

        const memberIndex = trousseau.members.findIndex(m => m.user.toString() === req.user.userId.toString());
        if (memberIndex === -1) {
            return res.status(403).json({ error: 'Not a member of this trousseau' });
        }

        trousseau.members.splice(memberIndex, 1);

        if (trousseau.members.length === 0) {
            trousseau.isShared = false;
        }

        await trousseau.save();
        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get a specific trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}:
 *   get:
 *     summary: Get a specific trousseau
 *     description: Retrieve details of a specific trousseau by its ID.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of the trousseau.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       404:
 *         description: Trousseau not found.
 *       500:
 *         description: Server error.
 */
router.get('/:trousseauId', async(req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId)
          .populate('owner', 'username pseudo')
          .populate('members.user', 'username pseudo');
        
        if (!trousseau) {
          return res.status(404).json({ error: 'Trousseau not found' });
        }
    
        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}:
 *   put:
 *     summary: Update a specific trousseau
 *     description: Update the details of a specific trousseau by its ID.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the trousseau
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     invitation:
 *                       type: string
 *                     permissions:
 *                       type: string
 *               isShared:
 *                 type: boolean
 *                 description: Updated sharing status
 *     responses:
 *       200:
 *         description: Trousseau updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       404:
 *         description: Trousseau not found.
 *       403:
 *         description: Unauthorized to update.
 *       500:
 *         description: Server error.
 */
router.put('/:trousseauId', async(req, res) => {
    const { name, members, isShared } = req.body;

    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId);
    
        if (!trousseau) {
          return res.status(404).json({ error: 'Trousseau not found' });
        }
    
        if (trousseau.owner.toString() !== req.user.userId.toString()) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
    
        trousseau.name = name || trousseau.name;
        trousseau.members = members || trousseau.members;
        trousseau.isShared = isShared !== undefined ? isShared : trousseau.isShared;
    
        await trousseau.save();
        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}:
 *   delete:
 *     summary: Delete a specific trousseau
 *     description: Delete a specific trousseau by its ID.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trousseau deleted successfully.
 *       404:
 *         description: Trousseau not found.
 *       403:
 *         description: Unauthorized to delete.
 *       500:
 *         description: Server error.
 */
router.delete('/:trousseauId', async(req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId);
    
        if (!trousseau) {
          return res.status(404).json({ error: 'Trousseau not found' });
        }
    
        if (trousseau.owner.toString() !== req.user.userId.toString()) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
    
        await Trousseau.findByIdAndDelete(trousseau);
        res.status(200).json({ message: 'Vault deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to add a member to a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}/add-member:
 *   post:
 *     summary: Add a member to a trousseau
 *     description: Add a user to a trousseau and update sharing status.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Pseudo of the user to add
 *     responses:
 *       200:
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trousseau'
 *       404:
 *         description: Trousseau or user not found.
 *       400:
 *         description: User already in the trousseau.
 *       500:
 *         description: Server error.
 */
router.post('/:trousseauId/add-member', async(req, res) => {
    const { name } = req.body;

    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId);

        if (!trousseau) {
            return res.status(404).json({ error: 'Trousseau not found' });
        }

        if (trousseau.owner.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await User.findOne ({ pseudo: name });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (trousseau.members.find(member => member.user.toString() === user._id.toString())) {
            return res.status(400).json({ error: 'User already in vault' });
        }

        trousseau.members.push({ user: user._id });

        trousseau.isShared = true;

        await trousseau.save();

        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to modify member permissions
/**
 * @swagger
 * /api/trousseau/{trousseauId}/member/{memberId}/permissions:
 *   put:
 *     summary: Modify permissions for a member
 *     description: Update permissions for a specific member of a trousseau.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *       - name: memberId
 *         in: path
 *         required: true
 *         description: ID of the member
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: string
 *                 enum:
 *                   - read
 *                   - edit
 *                 description: Updated permissions for the member
 *     responses:
 *       200:
 *         description: Permissions updated successfully.
 *       400:
 *         description: Invalid permissions value.
 *       404:
 *         description: Trousseau or member not found.
 *       403:
 *         description: Only the owner can change permissions.
 *       500:
 *         description: Server error.
 */
router.put('/:trousseauId/member/:memberId/permissions', async (req, res) => {
    const { trousseauId, memberId } = req.params;
    const { permissions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trousseauId) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: 'Invalid Trousseau ID or Member ID' });
    }

    if (!['read', 'edit'].includes(permissions)) {
        return res.status(400).json({ message: 'Invalid permissions value' });
    }

    try {
        const trousseau = await Trousseau.findById(trousseauId);

        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau not found' });
        }

        // Vérifier si l'utilisateur qui fait la requête est le propriétaire du trousseau
        if (req.user.userId !== trousseau.owner._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can change permissions' });
        }

        // Trouver le membre à mettre à jour
        const member = trousseau.members.find(m => m.user._id.toString() === memberId);

        if (!member) {
            return res.status(404).json({ message: 'Member not found in the trousseau' });
        }

        // Mettre à jour les permissions du membre
        member.permissions = permissions;

        await trousseau.save();

        res.status(200).json({ message: 'Permissions updated successfully', member });
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to remove a member from a trousseau
/**
 * @swagger
 * /api/trousseau/{trousseauId}/member/{memberId}:
 *   delete:
 *     summary: Remove a member from a trousseau
 *     description: Remove a specific member from a trousseau.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trousseauId
 *         in: path
 *         required: true
 *         description: ID of the trousseau
 *         schema:
 *           type: string
 *       - name: memberId
 *         in: path
 *         required: true
 *         description: ID of the member
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully.
 *       404:
 *         description: Trousseau or member not found.
 *       403:
 *         description: Only the owner can remove members.
 *       500:
 *         description: Server error.
 */
router.delete('/:trousseauId/member/:memberId', async (req, res) => {
    const { trousseauId, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(trousseauId) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: 'Invalid Trousseau ID or Member ID' });
    }

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau not found' });
        }

        // Vérifier si l'utilisateur qui fait la requête est le propriétaire du trousseau
        if (req.user.userId !== trousseau.owner._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can remove members' });
        }

        // Trouver l'index du membre à supprimer
        const memberIndex = trousseau.members.findIndex(m => m.user.toString() === memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in the trousseau' });
        }

        // Supprimer le membre
        trousseau.members.splice(memberIndex, 1);

        // Si plus aucun membre, désactiver le partage
        if (trousseau.members.length === 0) {
            trousseau.isShared = false;
        }

        await trousseau.save();

        res.status(200).json({ message: 'Member removed successfully', trousseau });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to export trousseaux and elements
/**
 * @swagger
 * /api/trousseau/transfer/export:
 *   get:
 *     summary: Export trousseaux and elements
 *     description: Export all trousseaux and their elements created by the user.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   trousseau:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       isShared:
 *                         type: boolean
 *                   elements:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         username:
 *                           type: string
 *                         password:
 *                           type: string
 *                         uris:
 *                           type: array
 *                           items:
 *                             type: string
 *                         note:
 *                           type: string
 *                         customFields:
 *                           type: array
 *                           items:
 *                             type: object
 *                         attachments:
 *                           type: array
 *                           items:
 *                             type: object
 *                         isSensitive:
 *                           type: boolean
 *                         permissions:
 *                           type: string
 *       500:
 *         description: Server error.
 */
router.get('/transfer/export', async (req, res) => {
    try {
        // Fetch all Trousseaux created by the user
        const trousseaux = await Trousseau.find({ owner: req.user.userId });

        const exportData = [];

        for (const trousseau of trousseaux) {
            // Fetch all elements linked to the current trousseau
            const elements = await Element.find({ trousseau: trousseau._id });

            // Prepare data to include trousseau and its elements
            exportData.push({
                trousseau: {
                    id: trousseau._id,
                    name: trousseau.name,
                    owner: trousseau.owner,
                    isShared: trousseau.isShared,
                },
                elements: elements.map(element => ({
                    id: element._id,
                    name: element.name,
                    username: element.username,
                    password: element.password,
                    uris: element.uris,
                    note: element.note,
                    customFields: element.customFields,
                    attachments: element.attachments,
                    isSensitive: element.isSensitive,
                    permissions: element.permissions
                })),
            });
        }

        const format = req.query.format || 'json'; // Determine export format (default to JSON)

        res.json(exportData); // Default JSON response
    } catch (error) {
        console.error('Error exporting trousseaux and elements:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to import trousseaux and elements
/**
 * @swagger
 * /api/trousseau/transfer/import:
 *   post:
 *     summary: Import trousseaux and elements
 *     description: Import trousseaux and elements from a file and save them.
 *     tags:
 *       - trousseau
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: Import successful.
 *       400:
 *         description: Invalid file or data format.
 *       500:
 *         description: Server error.
 */
router.post('/transfer/import', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const format = file.mimetype === 'text/csv' ? 'csv' : 'json';

        const importedData = [];

        const data = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        await saveImportedData(data, req.user.userId, format);
        res.status(200).json({ message: 'Import successful' });
    } catch (error) {
        console.error('Error importing trousseaux and elements:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path); // Cleanup uploaded file
        }
    }
});

// Helper function to save imported data
const saveImportedData = async (data, userId, format) => {
    // Process JSON data
    for (const trousseauObj of data) {
        const trousseau = new Trousseau({
            _id: new mongoose.Types.ObjectId(),
            name: trousseauObj.trousseau.name,
            owner: userId,
            members: trousseauObj.trousseau.members,
            isShared: trousseauObj.trousseau.isShared,
        });

        await trousseau.save();

        for (const element of trousseauObj.elements) {
            const newElement = new Element({
                _id: new mongoose.Types.ObjectId(),
                name: element.name,
                username: element.username,
                password: element.password,
                uris: element.uris,
                note: element.note,
                customFields: element.customFields,
                attachments: element.attachments,
                isSensitive: element.isSensitive,
                permissions: element.permissions,
                trousseau: trousseau._id
            });

            await newElement.save();
        }
    }
};

module.exports = router;
