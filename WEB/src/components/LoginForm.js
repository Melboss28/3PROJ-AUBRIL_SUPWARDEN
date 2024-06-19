// src/components/LoginForm.js
import React from 'react';
import './LoginForm.css';

const LoginForm = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Connexion</h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="login-button-container">
            <button type="submit" className="login-button">Se connecter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
