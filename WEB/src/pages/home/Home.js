import React from 'react';
import Header from '../../components/home/Header';
import Feature from '../../components/home/Feature';
import Footer from '../../components/home/Footer';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
    let navigate = useNavigate()

    const SignUp = () => {
        navigate('/auth/signup');
    }

    const Login = () => {
        navigate('/auth/login');
    }

    return (
        <div className="home">
            <Header />
            <main className="main-container">
                <h1 className="main-title">Bienvenue sur SUPWARDEN</h1>
                <p className="main-subtitle">Gérez vos mots de passe en toute sécurité et simplicité.</p>
                <button className="cta-button" onClick={SignUp}>Commencez maintenant</button>
                <p/>
                <button className="cta-button" onClick={Login}>Se connecter</button>
                <Feature />
                
            </main>
            <Footer />
        </div>
    );
};

export default Home;