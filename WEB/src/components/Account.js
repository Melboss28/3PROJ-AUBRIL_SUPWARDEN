import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  let navigate = useNavigate()

  const Logout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login')
  }

  const navAccount = () => {
    navigate('/app/account')
  }

  return (
    <div className="Account">
      <button onClick={navAccount}>Profil</button>
      <button>Paramètres</button>
      <button onClick={Logout}>Déconnexion</button>
    </div>
  );
}

export default Account;