import React, { useState } from 'react'
import './trousseaux.css'
import VerticalNavbar from '../../components/VerticalNavbar';
import TrousseauxList from '../../components/app/TrousseauxList';

const Trousseaux = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="page">
        <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
          <TrousseauxList />
        </div>
      </div>
    )
}

export default Trousseaux