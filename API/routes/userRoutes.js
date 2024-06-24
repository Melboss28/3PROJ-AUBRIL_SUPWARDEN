const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const authMiddleware = require('../JWT/authMiddleware');
// const Group = require('../models/group');

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
        // Si Compte avec Google
        if (user.google == true) {
            return res.status(404).json({ message: 'Veuillez utiliser Google pour votre connexion' });
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
            google: user.google
        };

        // Créer et renvoyer un jeton JWT contenant les informations de l'utilisateur
       const token = jwt.sign(userInfo, 'ONCzRs3kqu!yF?wH', { expiresIn: '5h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

// Route de connexion avec Google
/**
 * @swagger
 * /api/user/google-login:
 *   post:
 *     summary: Connexion avec Google
 *     description: Connexion d'utilisateur via Google OAuth.
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credentialResponse
 *             properties:
 *               credentialResponse:
 *                 type: object
 *                 properties:
 *                   credential:
 *                     type: string
 *     responses:
 *       200:
 *         description: Connexion réussie, retour du token JWT.
 *       404:
 *         description: Utilisateur non trouvé ou connexion incorrecte.
 *       500:
 *         description: Erreur du serveur.
 */
router.post('/google-login', async (req, res) => {
    const { credentialResponse } = req.body;

    try {
        //Décoder le token
        // Décoder le token JWT avec la clé secrète de Google
        const decodedToken = jwt.decode(credentialResponse.credential);

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ pseudo: decodedToken.name });
        if (!user) {
            return res.status(404).json({ message: 'Veuillez d\'abord vous inscrire ' });
        }

        // Si Pas avec Google
        if (user.google == false) {
            return res.status(404).json({ message: 'Veuillez vous connecter avec votre mot de passe' });
        }

        // Créer un objet contenant les informations de l'utilisateur à inclure dans le token
        const userInfo = {
            userId: user._id,
            email: user.email,
            pseudo: user.pseudo,
            google: user.google
        };

        // Créer et renvoyer un jeton JWT contenant les informations de l'utilisateur
        const token = jwt.sign(userInfo, process.env.KEY, { expiresIn: '5h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

// Route de création de compte
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: Inscription d'utilisateur avec email, pseudo, et mot de passe.
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
 *             properties:
 *               email:
 *                 type: string
 *               pseudo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compte créé avec succès.
 *       400:
 *         description: Données invalides ou compte déjà existant.
 *       500:
 *         description: Erreur du serveur.
 */
router.post('/register', async (req, res) => {
    const { email, pseudo, password } = req.body;

    try {
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
            password: hashedPassword
        });

        // Sauvegarder l'utilisateur dans la base de données
        await newUser.save();

        // Répondre avec succès
        res.json({ message: 'Compte Créé. Veuillez vous conencter.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur lors de la création de compte.' });
    }
});

// Route de création de compte avec Google
/**
 * @swagger
 * /api/user/google-register:
 *   post:
 *     summary: Créer un compte avec Google
 *     description: Crée un nouveau compte utilisateur à partir des données de Google OAuth.
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credentialResponse
 *             properties:
 *               credentialResponse:
 *                 type: object
 *                 properties:
 *                   credential:
 *                     type: string
 *     responses:
 *       200:
 *         description: Compte créé avec succès.
 *       400:
 *         description: L'email ou le pseudo est déjà utilisé.
 *       500:
 *         description: Erreur du serveur lors de la création du compte avec Google.
 */
router.post('/google-register', async (req, res) => {
    const { credentialResponse } = req.body;

    try {
        //Décoder le token
        // Décoder le token JWT avec la clé secrète de Google
        const decodedToken = jwt.decode(credentialResponse.credential);

        // Vérifier si l'utilisateur existe déjà dans la base de données
        const existingEmail = await User.findOne({ email: decodedToken.email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const existingUser = await User.findOne({ pseudo: decodedToken.name });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce pseudo est déjà utilisé.' });
        }

        // Créer un nouvel utilisateur avec les données renvoyées par Google
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            email: decodedToken.email,
            pseudo: decodedToken.name,
            google: true
        });

        // Enregistrer le nouvel utilisateur dans la base de données
        await newUser.save();

        // Répondre avec succès
        res.json({ message: 'Compte Créé avec Google. Veuillez vous conencter.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur lors de la création de compte avec Google.' });
    }
});


router.use(authMiddleware); // Appliquer le middleware d'authentification


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


// Route pour récupérer tous les utilisateurs qui ne sont pas dans un group
/**
 * @swagger
 * /api/user/notuser/{groupId}:
 *   get:
 *     summary: Obtenir les utilisateurs qui ne sont pas dans un groupe
 *     tags:
 *       - user
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: ID du groupe
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs hors du groupe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       pseudo:
 *                         type: string
 *       404:
 *         description: Groupe non trouvé.
 *       500:
 *         description: Erreur lors de la récupération des utilisateurs.
 */
router.get('/notuser/:groupId', async (req, res) => {
    const groupId = req.params.groupId;

    try {
        // Récupérer les membres du groupe spécifié
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé.' });
        }

        const membersInGroup = group.members;

        // Récupérer les utilisateurs qui ne sont pas membres du groupe spécifié
        const users = await User.find({ _id: { $nin: membersInGroup } });

        // Répondre avec la liste des utilisateurs qui ne sont pas membres du groupe
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

// Route pour récupérer tous les utilisateurs qui sont dans un group
/**
 * @swagger
 * /api/user/gooduser/{groupId}:
 *   get:
 *     summary: Obtenir les utilisateurs qui sont dans un groupe
 *     tags:
 *       - user
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: ID du groupe
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs du groupe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       pseudo:
 *                         type: string
 *       404:
 *         description: Groupe non trouvé.
 *       500:
 *         description: Erreur lors de la récupération des utilisateurs.
 */
router.get('/gooduser/:groupId', async (req, res) => {
    const groupId = req.params.groupId;

    try {
        // Récupérer les membres du groupe spécifié
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé.' });
        }

        const membersInGroup = group.members;

        // Récupérer les utilisateurs qui sont membres du groupe spécifié
        const users = await User.find({ _id: membersInGroup });

        // Répondre avec la liste des utilisateurs qui ne sont pas membres du groupe
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
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
router.put('/:userId', async (req, res) => {
    const userId = req.params.userId; // Récupérer l'ID de l'utilisateur à partir des paramètres d'URL
    const { email, pseudo, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si le mot de passe est correct
        if (password) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mot de passe incorrect.' });
            }
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

module.exports = router; // Exporte le routeur
