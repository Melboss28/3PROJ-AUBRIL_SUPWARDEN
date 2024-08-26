const mongoose = require('mongoose');
const express = require('express');
const Trousseau = require('../models/trousseau');
const User = require('../models/user');
const authMiddleware = require('../JWT/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Appliquer le middleware d'authentification

router.post('/create', async (req, res) => {
    const { name, members, isShared } = req.body;
    const owner = req.user.userId;
    try{
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

router.get('/my-trousseaux', async(req, res) => {
    try {
        const trousseaux = await Trousseau.find({ owner: req.user.userId });
        res.status(200).json(trousseaux);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

router.get('/:trousseauId', async(req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.trousseauId)
          .populate('owner', 'username email')
          .populate('members.user', 'username email');
        
        if (!trousseau) {
          return res.status(404).json({ error: 'Trousseau not found' });
        }
    
        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

        trousseau.members.push({ user: user._id});

        trousseau.isShared = true;

        await trousseau.save();

        res.status(200).json(trousseau);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; // Exporte le routeur