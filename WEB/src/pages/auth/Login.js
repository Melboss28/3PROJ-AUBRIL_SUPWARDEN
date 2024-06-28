import React, { useState } from 'react';
import LoginForm from '../../components/LoginForm';
import VerticalNavbar from '../../components/VerticalNavbar';
import './Login.css';

const Login = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default Login;
