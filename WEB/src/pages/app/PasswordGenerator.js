import React, { useState } from 'react';
import VerticalNavbar from '../../components/VerticalNavbar';
import './PasswordGenerator.css';
import Generator from '../../components/Generator';

const PasswordGenerator = () => {
  const [isOpen, setIsOpen] = useState(true);

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
