import React, { useState } from 'react';
import axios from 'axios';
import './accountDelete.css';
import { accountService } from '../../_services/account.service';
import { useNavigate } from 'react-router-dom';

const AccountDelete = () => {
    const [message, setMessage] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const deleteAccount = async () => {
        try {
            await axios.delete(`http://localhost:3001/api/user/delete`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            accountService.logout();
            navigate('/auth/login');
        } catch (error) {
            console.error('Error deleting user account:', error);
            setMessage(error.response?.data?.message || 'Une erreur est survenue');
        }
    }

    const handleDeleteClick = () => {
        setShowConfirmation(true);
    }

    const handleConfirmDelete = () => {
        deleteAccount();
    }

    const handleCancel = () => {
        setShowConfirmation(false);
    }

    return (
        <div className='AccountDelete'>
            <h2>Supprimer le compte</h2>
            {showConfirmation ? (
                <div className='confirmation'>
                    <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
                    <button onClick={handleConfirmDelete}>Oui, supprimer</button>
                    <button className='annuler' onClick={handleCancel}>Annuler</button>
                </div>
            ) : (
                <button onClick={handleDeleteClick}>Supprimer le compte</button>
            )}
            <p>{message}</p>
        </div>
    );
}

export default AccountDelete;
