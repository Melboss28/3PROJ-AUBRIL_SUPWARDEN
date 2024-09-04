import React, { useState } from 'react'
import './accountPIN.css'
import { accountService } from '../../_services/account.service';
import axios from 'axios';

const AccountPIN = () => {
    const [pin, setPin] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:3001/api/user/pin',{ pin, password } , {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage(error.response.data.message);
        }
    }

    // Fonction pour autoriser seulement les chiffres
    const handlePinChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {  // Vérifie que la valeur est composée uniquement de chiffres
            setPin(value);
        }
    }

    return (
        <div className='AccountPIN'>
            <h2>{accountService.getTokenInfo().ispin ? 'Modifier le PIN' : 'Créer un PIN'}</h2>
            <form onSubmit={handleSubmit} className='AccountPIN-form'>
                <label>Nouveau PIN:</label>
                <input 
                    type="text"
                    placeholder='4 à 6 chiffres'
                    value={pin} 
                    onChange={handlePinChange}
                    maxLength={6}
                    required 
                />
                <label>Mot de passe:</label>
                <input 
                    type="password" 
                    placeholder='Votre mot de passe'
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">{accountService.getTokenInfo().ispin ? 'Modifier' : 'Créer'}</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    )
}

export default AccountPIN
