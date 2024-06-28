import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './generator.css';

const Generator = () => {
    const [length, setLength] = useState(12);
    const [minUpper, setMinUpper] = useState(1);
    const [minLower, setMinLower] = useState(1);
    const [minNumbers, setMinNumbers] = useState(1);
    const [minSpecial, setMinSpecial] = useState(1);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    const [password, setPassword] = useState('');

    const generatePassword = () => {
        axios.post('http://localhost:3001/api/tool/generate-password', {
            length,
            minUpper,
            minLower,
            minNumbers,
            minSpecial,
            excludeAmbiguous
        })
        .then(response => {
            setPassword(response.data.password);
        })
        .catch(error => {
            console.error('There was an error generating the password!', error);
        });
    };

    useEffect(() => {
        generatePassword();
    }, [length, minUpper, minLower, minNumbers, minSpecial, excludeAmbiguous]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
    };

    return (
        <div className="Generator">
            <h1>Générateur de mot de passe</h1>
            <div className='slider-container'>
                <label>
                    Longueur: {length}
                    <input type="range" min="6" max="32" value={length} onChange={(e) => setLength(e.target.value)} />
                </label>
            </div>
            <div className='slider-container'>
                <label>
                    Majuscules minimum: {minUpper}
                    <input type="range" min="0" max="10" value={minUpper} onChange={(e) => setMinUpper(e.target.value)} />
                </label>
            </div>
            <div className='slider-container'>
                <label>
                    Minuscules minimum: {minLower}
                    <input type="range" min="0" max="10" value={minLower} onChange={(e) => setMinLower(e.target.value)} />
                </label>
            </div>
            <div className='slider-container'>
                <label>
                    Chiffres minimum: {minNumbers}
                    <input type="range" min="0" max="10" value={minNumbers} onChange={(e) => setMinNumbers(e.target.value)} />
                </label>
            </div>
            <div className='slide-container'>
                <label>
                    Caractères spéciaux minimum: {minSpecial}
                    <input type="range" min="0" max="10" value={minSpecial} onChange={(e) => setMinSpecial(e.target.value)} />
                </label>
            </div>
            <div>
                <label>
                    Exclure les caractères ambigus:
                    <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} />
                </label>
            </div>
            <button onClick={generatePassword}>Générer</button>
            {password && (
                <div>
                    <p>Mot de passe généré: {password}</p>
                    <button onClick={copyToClipboard}>Copier dans le presse-papier</button>
                </div>
            )}
        </div>
    );
}

export default Generator;
