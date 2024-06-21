import React from 'react';
import './VerticalNavbar.css';

const VerticalNavbar = ({ isOpen, setIsOpen }) => {
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`vertical-navbar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-button" onClick={toggleNavbar}>
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
        </svg>
      </button>
      <div className="navbar-links">
        <a href="#trousseaux">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4a4 4 0 110 8 4 4 0 010-8zm0-2a6 6 0 100 12A6 6 0 0012 2zm5.47 9.12a1 1 0 00-1.34 1.5l2.45 2.45a1 1 0 101.41-1.41l-2.45-2.45a1 1 0 00-.07-.09zM17.58 14l-3 3h-.79v1.79l-2.34 2.34a1 1 0 101.41 1.41l2.34-2.34H17a1 1 0 000-2h-1.79l3-3a1 1 0 00-1.41-1.41z" />
          </svg>
          {isOpen && <span>Trousseaux</span>}
        </a>
        <a href="#services">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 00-3.87 19.27c.61.11.83-.27.83-.6v-2.24c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.76.08-.75.08-.75 1.21.09 1.85 1.25 1.85 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.97 0-1.32.47-2.4 1.25-3.24-.13-.31-.54-1.56.12-3.24 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02.005 2.05.138 3.02.405 2.28-1.555 3.29-1.223 3.29-1.223.66 1.68.25 2.93.12 3.24.78.84 1.25 1.92 1.25 3.24 0 4.64-2.81 5.66-5.49 5.96.43.37.82 1.1.82 2.21v3.28c0 .33.22.72.84.6A10 10 0 0012 2z" />
          </svg>
          {isOpen && <span>Services</span>}
        </a>
        <a href="#about">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {isOpen && <span>About</span>}
        </a>
        <a href="#contact">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 8V7l-3 2-2-1-3 2-3-2-2 1-3-2v1l3 2 2-1 3 2 3-2 2 1 3-2zm0-2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2zm-2 10V6H5v10h14zM4 6v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" />
          </svg>
          {isOpen && <span>Contact</span>}
        </a>
      </div>
    </div>
  );
};

export default VerticalNavbar;
