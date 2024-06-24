import React, {useState} from 'react';
// import { Link } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import './LoginForm.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../_services/account.service';

const LoginForm = () => {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [errorGoogleMessage, setErrorGoogleMessage] = useState('');
  let navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`http://localhost:3001/api/user/login`, { pseudo, password });
        const token = response.data.token;
        console.log('Token JWT:', token);
        setErrorMessage('');
        accountService.saveToken(token)
        console.log(accountService.getToken())
        navigate('/app')
    } catch (error) {
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
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="pseudo">Nom d'utilisateur</label>
            <input type="username" value={pseudo} onChange={(e) => setPseudo(e.target.value)} required/>
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" value={password}onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="login-button-container">
            <button type="submit" className="login-button">Se connecter</button>
          </div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
