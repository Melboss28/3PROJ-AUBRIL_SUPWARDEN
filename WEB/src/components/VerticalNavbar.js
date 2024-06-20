// src/VerticalNavbar.js
import React, { useState } from 'react';
import './VerticalNavbar.css';

const VerticalNavbar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`vertical-navbar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-button" onClick={toggleNavbar}>
        {isOpen ? '<<' : '>>'}
      </button>
      {isOpen && (
        <div className="navbar-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      )}
    </div>
  );
};

export default VerticalNavbar;
