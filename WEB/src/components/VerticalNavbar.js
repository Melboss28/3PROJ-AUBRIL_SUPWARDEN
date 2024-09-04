import React from 'react';
import { Link } from 'react-router-dom';
import './VerticalNavbar.css';
import trousseaupng from '../img/trousseau.png';
import chatpng from '../img/chat.png';
import settingpng from '../img/setting.png';
import logoutpng from '../img/logout.png';
import generatorpng from '../img/cadena.png';

const VerticalNavbar = ({ isOpen, setIsOpen }) => {

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const Logout = () => {
    localStorage.removeItem('token');
  }

  return (
    <div className={`vertical-navbar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-button" onClick={toggleNavbar}>
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M480,224H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h448c17.673,0,32-14.327,32-32S497.673,224,480,224z"/>
          <path d="M32,138.667h448c17.673,0,32-14.327,32-32s-14.327-32-32-32H32c-17.673,0-32,14.327-32,32S14.327,138.667,32,138.667z"/>
          <path d="M480,373.333H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h448c17.673,0,32-14.327,32-32S497.673,373.333,480,373.333z"/>
        </svg>
      </button>
      <div className="navbar-links">
        <div className="category">
          <div className="category-title">Navigation</div>
          <Link to="/app/Trousseaux">
            <img className='icon' src={trousseaupng} alt="Trousseau" />
            {isOpen && <span>Trousseaux</span>}
          </Link>
        </div>
        <div className="category">
          <div className="category-title">Outils</div>
          <Link to="/app/password-generator">
            <img className='icon' src={generatorpng} alt="generator"/>
            {isOpen && <span>Générateur</span>}
          </Link>
          <Link to="/app/chat">
            <img className='icon' src={chatpng} alt="chat"/>
            {isOpen && <span>Messagerie</span>}
          </Link>
        </div>
        <div className="category">
          <div className="category-title">Profil</div>
          <Link to="/app/account">
            <img className='icon' src={settingpng} alt="setting"/>
            {isOpen && <span>Paramètres</span>}
          </Link>
          <div>
            <Link onClick={Logout} to="/auth/login">
              <img className='icon' src={logoutpng} alt="logout"/>
              {isOpen && <span>Déconnexion</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalNavbar;
