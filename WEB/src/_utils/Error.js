import React from 'react';
import Header from '../components/home/Header'
import './error.css'

const Error = () => {
    return (
        <div className='error'>
            <Header/>
            <div className='error__content'>
                <h1>404</h1>
                <h3>Page non trouvée</h3>
                <p>Désolé, la page que vous recherchez n'existe pas. Si vous pensez qu'il y a un problème, veuillez signaler un incident.</p>
                <button onClick={() => window.location.href = '/'}>Retour à l'accueil</button>
            </div>
        </div>
    );
};

export default Error;
