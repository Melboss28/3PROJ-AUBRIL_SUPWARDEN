// src/components/SignUpForm.js
import React from 'react';
import './LoginForm.css'; // Réutiliser les mêmes styles

const SignUpForm = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Inscription</h2>
        <form>
          <div className="input-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input type="password" id="confirm-password" name="confirm-password" required />
          </div>
          <div className="login-button-container">
            <button type="submit" className="login-button">S'inscrire</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
