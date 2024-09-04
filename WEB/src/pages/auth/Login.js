import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import './login.css';
import Header from '../../components/home/Header';

const Login = () => {

  return (
    <div className="login-page">
      <Header/>
      <LoginForm />
      <p className='change'>Vous n'avez pas de compte ? <a href="/auth/signup">Inscrivez-vous</a></p>
    </div>
  );
};

export default Login;
