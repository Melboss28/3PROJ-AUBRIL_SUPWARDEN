import React, { useState } from 'react';
import VerticalNavbar from '../../components/VerticalNavbar';
import ElementList from '../../components/app/ElementList';

const TrousseauxDetails = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="page">
            <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
                <ElementList/>
            </div>
        </div>
    )
}

export default TrousseauxDetails