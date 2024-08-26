import React, { useState } from 'react'
import './trousseaux.css'
import VerticalNavbar from '../../components/VerticalNavbar';
import ElementDetails from '../../components/app/ElementDetails';

const Element = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="page">
        <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
          <ElementDetails/>
        </div>
      </div>
    )
}

export default Element