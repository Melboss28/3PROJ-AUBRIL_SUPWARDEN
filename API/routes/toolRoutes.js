const express = require('express');

const router = express.Router();

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
