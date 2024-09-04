import React, { useState } from 'react'
import './accountLink.css'
import { accountService } from '../../_services/account.service';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import poubellepng from '../../img/poubelle.png';

const AccountLink = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [goodMessage, setGoodMessage] = useState('');

    const handleGoogleLoginSuccess = async (response) => {
        try {
            const res = await axios.post('http://localhost:3001/api/user/google-link', { tokenId: response.credential }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setGoodMessage(res.data.message);
        } catch (error) {
          console.error('Erreur lors de la Laison Google', error);
          setErrorMessage(error.response.data.message);
        }
    };

    const deleteGoogleLink = async () => {
        try {
            const res = await axios.delete('http://localhost:3001/api/user/google-link', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setGoodMessage(res.data.message);
        } catch (error) {
            console.error('Erreur lors de la suppression de la Laison Google', error);
            setErrorMessage(error.response.data.message);
        }
    }

    return (
        <div className='AccountLink'>
            <h2>Comptes Liés</h2>
            <div className='google'>
                {accountService.getTokenInfo().googleId ? (
                    <>
                        <p>Google : Lié</p>
                        <img className='icon' src={poubellepng} alt='delete' onClick={deleteGoogleLink}/>
                    </>
                ) : ( 
                    <>
                        <p>Google : Non lié</p>
                        <GoogleLogin
                            text="signin_with"
                            shape='rectangular'
                            logo_alignment="left"
                            locale='fr'
                            ux_mode='popup'
                            context='signin'
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    </>
                )}
                { errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div> }
                { goodMessage && <div style={{ color: 'green' }}>{goodMessage}</div> }
            </div>
        </div>
    )
}

export default AccountLink