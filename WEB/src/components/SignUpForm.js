import React, {useState} from 'react';
// import { Link } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import './LoginForm.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../_services/account.service';

const SignUpForm = () => {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [errorGoogleMessage, setErrorGoogleMessage] = useState('');
  const [goodMessage, setGoodMessage] = useState('');
  // const [goodGoogleMessage, setGoodGoogleMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`http://localhost:3001/api/user/register`, { email, pseudo, password });
        // Réinitialiser le message d'erreur en cas de succès
        setErrorMessage('');
        setGoodMessage(response.data.message);
    } catch (error) {
        setGoodMessage('');
        if (error.response && error.response.data && error.response.data.message) {
            // Si la réponse de l'API contient un message d'erreur
            const errorMessage = error.response.data.message;
            console.error('Erreur de réponse de l\'API:', errorMessage);
            setErrorMessage(errorMessage);
        } else {
            // Si la réponse de l'API ne contient pas de message d'erreur, afficher un message générique
            console.error('Erreur:', error.message);
            setErrorMessage('Une erreur est survenue.');
        }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="login-button-container">
            <button type="submit" className="login-button">S'inscrire</button>
          </div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {goodMessage && <div style={{ color: 'green' }}>{goodMessage}</div>}
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
