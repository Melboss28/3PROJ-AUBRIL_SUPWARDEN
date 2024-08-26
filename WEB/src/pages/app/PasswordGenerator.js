import React, { useState } from 'react';
import VerticalNavbar from '../../components/VerticalNavbar';
import './passwordGenerator.css';
import Generator from '../../components/app/Generator';

const PasswordGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="PasswordGenerator-page">
      <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
        <Generator />
      </div>
    </div>
  );
};

export default PasswordGenerator;
