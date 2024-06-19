// src/App.js
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      {isLogin ? (
        <LoginForm />
      ) : (
        <SignUpForm />
      )}
      <div className="toggle-container">
        {isLogin ? (
          <p>
            Vous n'avez pas de compte ?{' '}
            <button onClick={() => setIsLogin(false)} className="toggle-button">S'inscrire</button>
          </p>
        ) : (
          <p>
            Vous avez déjà un compte ?{' '}
            <button onClick={() => setIsLogin(true)} className="toggle-button">Se connecter</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
