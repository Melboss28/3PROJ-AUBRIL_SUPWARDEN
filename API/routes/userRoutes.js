const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const authMiddleware = require('../JWT/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router(); // Crée un routeur express


// Route de connexion
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Connexion d'utilisateur
 *     description: Permet aux utilisateurs de se connecter avec un pseudo et un mot de passe.
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pseudo
 *               - password
 *             properties:
 *               pseudo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie, retour du token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Mauvais pseudo ou mot de passe.
 *       500:
 *         description: Erreur du serveur.
 */
router.post('/login', async (req, res) => {
    const { pseudo, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ pseudo });
        if (!user) {
            return res.status(404).json({ message: 'Username/Password incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Username/Password incorrect' });
        }

        // Créer un objet contenant les informations de l'utilisateur à inclure dans le token
        const userInfo = {
            userId: user._id,
            email: user.email,
            pseudo: user.pseudo,
            ispassword: user.ispassword,
            googleId: user.googleId,
            ispin: user.ispin,
        };

        // Créer et renvoyer un jeton JWT contenant les informations de l'utilisateur
       const token = jwt.sign(userInfo, process.env.JWT_KEY, { expiresIn: '5h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: Inscription d'utilisateur avec email, pseudo, mot de passe et confirmation de mot de passe.
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pseudo
 *               - password
 *               - confirmpassword
 *             properties:
 *               email:
 *                 type: string
 *               pseudo:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8  # Ajout de la contrainte de longueur minimale
 *               confirmpassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compte créé avec succès.
 *       400:
 *         description: Données invalides (par exemple, mots de passe non identiques ou longueur insuffisante).
 *       500:
 *         description: Erreur du serveur.
 */
router.post('/register', async (req, res) => {
    const { email, pseudo, password, confirmPassword } = req.body;

    try {
        // Vérifier que le mot de passe et la confirmation sont identiques
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
        }

        // Vérifier que le mot de passe a au moins 8 caractères
        if (password.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe doit faire au moins 8 caractères.' });
        }

        // Vérifier si l'utilisateur existe déjà
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        existingUser = await User.findOne({ pseudo });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce pseudo est déjà utilisé.' });
        }

        // Crypter le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            pseudo,
            password: hashedPassword,
            ispassword: true
        });

        // Sauvegarder l'utilisateur dans la base de données
        await newUser.save();

        // Répondre avec succès
        res.json({ message: 'Compte créé. Veuillez vous connecter.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur lors de la création de compte.' });
    }
});

/**
 * @swagger
 * /api/user/google-login:
 *   post:
 *     summary: Connexion d'utilisateur via Google
 *     description: Permet à un utilisateur de se connecter via un token d'authentification Google.
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Token d'authentification Google
 *     responses:
 *       200:
 *         description: Connexion réussie, retour du token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Erreur lors de la connexion Google.
 */
router.post('/google-login', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                _id: new mongoose.Types.ObjectId(),
                email,
                pseudo: name,
                ispassword: false,
                googleId,
                ispin: false,
            });

            await user.save();
        }

        // Générer un token JWT
        const jwtToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                pseudo: user.pseudo,
                ispassword: user.ispassword,
                googleId: user.googleId,
                ispin: user.ispin,
            },
            process.env.JWT_KEY,
            { expiresIn: '5h' }
        );

        res.status(200).json({ token: jwtToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la connexion Google' });
    }
});

router.use(authMiddleware); // Appliquer le middleware d'authentification

/**
 * @swagger
 * /api/user/google-link:
 *   post:
 *     summary: Lier un compte Google à un utilisateur existant
 *     description: Permet à un utilisateur de lier son compte Google à son compte existant.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Token d'authentification Google
 *     responses:
 *       200:
 *         description: Compte Google ajouté avec succès.
 *       400:
 *         description: Ce compte Google est déjà lié à un autre utilisateur.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur lors de l'ajout du compte Google.
 */
router.post('/google-link', async (req, res) => {
    const { tokenId } = req.body;
    const userId = req.user.userId;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture, sub: googleId } = ticket.getPayload();

        // Vérifier si le compte Google est déjà lié à un autre utilisateur
        let existingUser = await User.findOne({ googleId });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce compte Google est déjà lié à un autre utilisateur.' });
        }

        // Trouver l'utilisateur existant avec userId
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Associer les informations du compte Google à l'utilisateur existant
        user.googleId = googleId;
        user.picture = picture;
        await user.save();

        res.status(200).json({ message: 'Compte Google ajouté avec succès.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du compte Google.' });
    }
});

/**
 * @swagger
 * /api/user/google-link:
 *   delete:
 *     summary: Supprimer le lien entre un utilisateur et son compte Google
 *     description: Permet à un utilisateur de supprimer le lien entre son compte et son compte Google.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte Google supprimé avec succès.
 *       400:
 *         description: Aucun compte Google lié à cet utilisateur.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur lors de la suppression du compte Google.
 */
router.delete('/google-link', async (req, res) => {
    const userId = req.user.userId;

    try {
        // Trouver l'utilisateur existant avec userId
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si l'utilisateur a un compte Google lié
        if (!user.googleId) {
            return res.status(400).json({ message: 'Aucun compte Google lié à cet utilisateur.' });
        }

        // Supprimer les informations liées au compte Google
        user.googleId = undefined;
        user.picture = undefined;
        await user.save();

        res.status(200).json({ message: 'Compte Google supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du compte Google.' });
    }
});

// Route pour supprimer un utilisateur par son propriétaire
/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Supprimer un compte utilisateur
 *     description: Supprime le compte de l'utilisateur connecté.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur du serveur lors de la suppression de l'utilisateur.
 */
router.delete('/delete', async (req, res) => {
    const userId = req.user.userId; // Récupérer l'ID de l'utilisateur à partir du jeton JWT

    try {
        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Supprimer l'utilisateur de tous les groupes où il est membre
        // await Group.updateMany({ members: userId }, { $pull: { members: userId } });

        // Supprimer l'utilisateur
        await User.findByIdAndDelete(userId);

        // Répondre avec succès
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur lors de la suppression de l\'utilisateur' });
    }
});

// Route d'affichage des détails d'un user
/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Obtenir les détails d'un utilisateur
 *     tags:
 *       - user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 pseudo:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur lors de la récupération des détails de l'utilisateur.
 */
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId; // Récupérer l'ID du user à partir des paramètres d'URL

    try {
        // Rechercher le user par son ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User non trouvé.' });
        }

        // Répondre avec les détails du user
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des détails du user.' });
    }
});

// Route pour modifier l'email et le pseudo d'un utilisateur en vérifiant le mot de passe actuel
/**
 * @swagger
 * /api/user/{userId}:
 *   put:
 *     summary: Modifier l'email et le pseudo d'un utilisateur
 *     description: Permet à un utilisateur de mettre à jour son email et son pseudo. Nécessite un token JWT pour l'authentification et une vérification du mot de passe.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pseudo
 *             properties:
 *               email:
 *                 type: string
 *                 description: Nouvelle adresse e-mail de l'utilisateur
 *               pseudo:
 *                 type: string
 *                 description: Nouveau pseudo de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe actuel pour la vérification
 *     responses:
 *       200:
 *         description: Modification réussie. L'utilisateur doit se reconnecter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Mot de passe incorrect ou doublon dans les données (email ou pseudo déjà utilisés).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:userId/edit', async (req, res) => {
    const userId = req.params.userId; // Récupérer l'ID de l'utilisateur à partir des paramètres d'URL
    const { email, pseudo, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si le mot de passe est correct
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur.' });
            }
        }

        // Vérifier si le pseudo est déjà utilisé par un autre utilisateur
        if (pseudo && pseudo !== user.pseudo) {
            const existingUserWithPseudo = await User.findOne({ pseudo });
            if (existingUserWithPseudo) {
                return res.status(400).json({ message: 'Ce pseudo est déjà utilisé par un autre utilisateur.' });
            }
        }

        // Mettre à jour les données de l'utilisateur avec les nouvelles valeurs fournies
        if (email) user.email = email;
        if (pseudo) user.pseudo = pseudo;

        // Sauvegarder les modifications dans la base de données
        await user.save();

        // Répondre avec succès
        res.status(200).json({ message: 'Utilisateur modifiés avec succès. Se reconnecter pour voir les effets s\'appliquer' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de l\'utilisateur.' });
    }
});

// Route de modification du mot de passe
/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Modifier le mot de passe d'un utilisateur
 *     description: Permet à un utilisateur de changer son mot de passe en fournissant l'ancien et le nouveau mot de passe.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Mot de passe actuel de l'utilisateur
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe de l'utilisateur (min 8 caractères)
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès.
 *       400:
 *         description: Mot de passe actuel incorrect ou nouveau mot de passe trop court.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur du serveur.
 */
router.put('/change-password', async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
        //Vérifier si le compte a un mot de passe
        if (user.password) {
            // Vérifier si le mot de passe actuel est correct
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
            }
        }

        // Vérifier que le nouveau mot de passe a au moins 8 caractères
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 8 caractères.' });
        }

        // Crypter le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur
        user.password = hashedNewPassword;
        await user.save();

        // Répondre avec succès
        res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur lors de la modification du mot de passe.' });
    }
});

/**
 * @swagger
 * /api/user/pseudo/{id}:
 *   get:
 *     summary: Obtenir le pseudo d'un utilisateur par son ID
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pseudo de l'utilisateur trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pseudo:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la récupération du pseudo
 */
router.get('/pseudo/:id', async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      if (user) {
        res.json({ pseudo: user.pseudo });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error fetching user' });
    }
});

/**
 * @swagger
 * /api/user/by-pseudo/{pseudo}:
 *   get:
 *     summary: Obtenir les détails d'un utilisateur par son pseudo
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pseudo
 *         in: path
 *         required: true
 *         description: Pseudo de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur trouvés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 pseudo:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la récupération des détails de l'utilisateur
 */
router.get('/by-pseudo/:pseudo', async (req, res) => {
    try {
      const user = await User.findOne({ pseudo: req.params.pseudo });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error fetching user' });
    }
});

/**
 * @swagger
 * /api/user/conversation:
 *   post:
 *     summary: Créer une nouvelle conversation entre deux utilisateurs
 *     description: Crée une conversation si elle n'existe pas déjà entre les utilisateurs spécifiés.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otherUserId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur connecté
 *               otherUserId:
 *                 type: string
 *                 description: ID de l'autre utilisateur
 *     responses:
 *       201:
 *         description: Conversation créée avec succès
 *       400:
 *         description: Conversation déjà existante
 *       500:
 *         description: Erreur lors de la création de la conversation
 */
router.post('/conversation', async (req, res) => {
    const { userId, otherUserId } = req.body;

    try {
        // Vérifiez si une conversation entre ces utilisateurs existe déjà
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] }
        });

        if (conversation) {
            console.log("Conversation already exists");
            return res.status(400).json({ message: 'Conversation already exists' });
        }

        // Créez une nouvelle conversation si elle n'existe pas encore
        conversation = new Conversation({
            participants: [userId, otherUserId]
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ error: 'Error creating conversation' });
    }
});

/**
 * @swagger
 * /api/user/pin:
 *   put:
 *     summary: Mettre à jour le PIN d'un utilisateur
 *     description: Met à jour le PIN de l'utilisateur connecté en vérifiant le mot de passe actuel s'il est défini.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *                 description: Nouveau PIN de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe actuel pour la vérification (optionnel)
 *     responses:
 *       200:
 *         description: PIN mis à jour avec succès
 *       400:
 *         description: Mot de passe incorrect ou PIN non fourni
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la mise à jour du PIN
 */
router.put('/pin', async (req, res) => {
    const userId = req.user.userId;
    const { pin, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Si l'utilisateur a un mot de passe, vérifier le mot de passe
        if (user.password) {
            if (!password) {
                return res.status(400).json({ message: 'Le mot de passe est requis.' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mot de passe incorrect.' });
            }
        }

        // Hacher le nouveau PIN
        const hashedPin = await bcrypt.hash(pin, 10);

        // Mettre à jour le PIN haché et le champ ispin
        user.pin = hashedPin;
        user.ispin = true;
        await user.save();

        res.status(200).json({ message: 'PIN mis à jour avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du PIN.' });
    }
});

/**
 * @swagger
 * /api/user/verify-pin:
 *   post:
 *     summary: Vérifier le PIN d'un utilisateur
 *     description: Vérifie si le PIN fourni est correct pour l'utilisateur connecté.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *                 description: PIN à vérifier
 *     responses:
 *       200:
 *         description: PIN vérifié avec succès
 *       400:
 *         description: PIN incorrect
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la vérification du PIN
 */
router.post('/verify-pin', async (req, res) => {
    const userId = req.user.userId;
    const { pin } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si le PIN est correct
        const isValidPin = await bcrypt.compare(pin, user.pin);
        if (!isValidPin) {
            return res.status(400).json({ message: 'PIN incorrect.' });
        }

        res.status(200).json({ message: 'PIN vérifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la vérification du PIN.' });
    }
});

/**
 * @swagger
 * /api/user/verify-password:
 *   post:
 *     summary: Vérifier le mot de passe d'un utilisateur
 *     description: Vérifie si le mot de passe fourni est correct pour l'utilisateur connecté.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Mot de passe à vérifier
 *     responses:
 *       200:
 *         description: Mot de passe vérifié avec succès
 *       400:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la vérification du mot de passe
 */
router.post('/verify-password', async (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si le password est correct
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        res.status(200).json({ message: 'Mot de passe vérifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe.' });
    }
});

module.exports = router; // Exporte le routeur
