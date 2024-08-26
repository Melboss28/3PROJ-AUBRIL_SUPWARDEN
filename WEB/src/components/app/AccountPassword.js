import React, { useState } from 'react';
import axios from 'axios';
import './accountPassword.css';
import { accountService } from '../../_services/account.service';

const AccountPassword = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:3001/api/user/change-password', passwordData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage(error.response.data.message);
        }
    };

    return (
        <div className='AccountPassword'>
            <h2>Modifier Mot de Passe</h2>
            <form onSubmit={handleSubmit} className="AccountPassword-form">
                <label>Mot de passe actuel</label>
                <input 
                    type='password' 
                    name='currentPassword' 
                    value={passwordData.currentPassword} 
                    onChange={handleInputChange} 
                    placeholder='Mot de passe actuel' 
                    required 
                />
                <label>Nouveau mot de passe</label>
                <input 
                    type='password' 
                    name='newPassword' 
                    value={passwordData.newPassword} 
                    onChange={handleInputChange} 
                    placeholder='Nouveau mot de passe' 
                    required 
                />
                <button type='submit'>Change Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default AccountPassword;
