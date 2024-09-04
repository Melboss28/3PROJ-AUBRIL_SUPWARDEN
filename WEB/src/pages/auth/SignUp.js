import React from 'react';
import SignUpForm from '../../components/auth/SignUpForm';
import './signup.css';
import Header from '../../components/home/Header';

const SignUp = () => {
    
    return (
        <div className="signup-page">
            <Header/>
            <SignUpForm />
            <p className='change'>Vous avez déjà un compte ? <a href="/auth/login">Connectez-vous</a></p>
        </div>
    );
};

export default SignUp;