import React, { useState } from 'react';
import axios from 'axios';
import './accountEdit.css';
import { accountService } from '../../_services/account.service';

const AccountEdit = () => {
    const [userData, setUserData] = useState({
        username: accountService.getTokenInfo().pseudo,
        email: accountService.getTokenInfo().email,
        password: ''
    });
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = accountService.getTokenInfo().userId;

        try {
            const response = await axios.put(`http://localhost:3001/api/user/${userId}/edit`, userData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            setEditing(false);
        } catch (error) {
            console.error('Error updating user data:', error);
            setMessage(error.response.data.message);
        }
    };

    return (
        <div className='AccountEdit'>
            <h2>Vos informations</h2>
            {editing ? (
                <form onSubmit={handleSubmit} className="AccountEdit-form">
                    <label>Nom d'utilisateur</label>
                    <input 
                        type='text' 
                        name='username' 
                        value={userData.username} 
                        onChange={handleInputChange} 
                        placeholder="Nom d'utilisateur" 
                    />
                    <label>Email</label>
                    <input 
                        type='text' 
                        name='email' 
                        value={userData.email} 
                        onChange={handleInputChange} 
                        placeholder='Email' 
                    />
                    <label>Mot de passe (nécessaire pour confirmer les modifications)</label>
                    <input 
                        type='password' 
                        name='password' 
                        value={userData.password} 
                        onChange={handleInputChange} 
                        placeholder='Mot de passe' 
                    />
                    <button type='submit'>Save Changes</button>
                    <button type='button' onClick={() => setEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div>
                    <div>
                        <h3>Nom d'utilisateur:</h3>
                        <p>{userData.username}</p>
                    </div>
                    <div>
                        <h3>Email:</h3>
                        <p>{userData.email}</p>
                    </div>
                    <button className="edit-button" onClick={() => setEditing(true)}>Modifier</button>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    )
}

export default AccountEdit;
