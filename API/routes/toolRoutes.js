const express = require('express');
const authMiddleware = require('../JWT/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Appliquer le middleware d'authentification

/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordRequest:
 *       type: object
 *       properties:
 *         length:
 *           type: integer
 *           description: Length of the generated password.
 *         minUpper:
 *           type: integer
 *           description: Minimum number of uppercase letters.
 *         minLower:
 *           type: integer
 *           description: Minimum number of lowercase letters.
 *         minNumbers:
 *           type: integer
 *           description: Minimum number of numbers.
 *         minSpecial:
 *           type: integer
 *           description: Minimum number of special characters.
 *         excludeAmbiguous:
 *           type: boolean
 *           description: Exclude ambiguous characters (e.g., I, l, O, 0, etc.)
 *       required:
 *         - length
 *         - minUpper
 *         - minLower
 *         - minNumbers
 *         - minSpecial
 *         - excludeAmbiguous
 *     PasswordResponse:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           description: The generated password.
 *       required:
 *         - password
 */

/**
 * @swagger
 * /api/tools/generate-password:
 *   post:
 *     summary: Generate a password
 *     description: Generate a secure password based on the specified criteria.
 *     tags:
 *       - Tools
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Criteria for generating the password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordRequest'
 *     responses:
 *       200:
 *         description: Successfully generated the password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordResponse'
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Server error.
 */

function generatePassword(length, minUpper, minLower, minNumbers, minSpecial, excludeAmbiguous) {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+[]{}|;:,.<>?';
    const ambiguous = 'ILlO0S5';

    let allChars = '';
    let password = '';

    if (!excludeAmbiguous) {
        allChars = upperCase + lowerCase + numbers + special;
    } else {
        allChars = upperCase.replace(/[IL]/g, '') +
                   lowerCase.replace(/[l]/g, '') +
                   numbers.replace(/[O0]/g, '') +
                   special.replace(/[S5]/g, '');
    }

    function addRandomChars(charSet, minCount) {
        for (let i = 0; i < minCount; i++) {
            password += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
    }

    addRandomChars(upperCase, minUpper);
    addRandomChars(lowerCase, minLower);
    addRandomChars(numbers, minNumbers);
    addRandomChars(special, minSpecial);

    while (password.length < length) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

router.post('/generate-password', (req, res) => {
    const { length, minUpper, minLower, minNumbers, minSpecial, excludeAmbiguous } = req.body;
    const password = generatePassword(length, minUpper, minLower, minNumbers, minSpecial, excludeAmbiguous);
    res.json({ password });
});

module.exports = router; // Exporte le routeur
