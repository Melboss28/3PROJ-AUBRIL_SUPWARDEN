import React, { useState } from 'react';
import SignUpForm from '../../components/SignUpForm';
import VerticalNavbar from '../../components/VerticalNavbar';
import './Login.css';

const SignUp = () => {
    const [isOpen, setIsOpen] = useState(true);
    
    return (
        <div className="login-page">
            <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
            <SignUpForm />
            </div>
      </div>
    );
};

export default SignUp;