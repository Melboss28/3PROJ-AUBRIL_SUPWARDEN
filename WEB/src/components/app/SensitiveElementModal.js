import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { accountService } from '../../_services/account.service';

const SensitiveElementModal = ({ onClose }) => {
    const [pin, setPin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handlePinSubmit = async () => {
        try {
            // Envoie une requête au serveur pour vérifier le code PIN
            const response = await axios.post(`http://localhost:3001/api/user/verify-pin`, { pin },{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            onClose(true);
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            // Envoie une requête au serveur pour vérifier le code PIN
            const response = await axios.post(`http://localhost:3001/api/user/verify-password`, { password },{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            onClose(true);
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    return (
        <Modal
            isOpen={true}
            onRequestClose={() => onClose(false)}
            contentLabel="Enter PIN or Password"
        >
            {accountService.getTokenInfo().ispin ? (
                <>
                    <h2>Enter your PIN to access this element</h2>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter PIN"
                    />
                    <button onClick={handlePinSubmit}>Submit</button>
                </>
            ) : (
                <>
                    <h2>Enter your password to access this element</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                    <button onClick={handlePasswordSubmit}>Submit</button>
                </>
            )}
            {error && <p>{error}</p>}
            <button onClick={() => onClose(false)}>Cancel</button>
        </Modal>
    );
};

export default SensitiveElementModal;
