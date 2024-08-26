import React from 'react';
import './feature.css';

const features = [
  {
    icon: '🔒',
    title: 'Sécurité Maximale',
    description: 'Vos mots de passe sont cryptés et stockés en toute sécurité.'
  },
  {
    icon: '🔐',
    title: 'Simplicité',
    description: 'Gérez vos mots de passe facilement grâce à une interface intuitive.'
  },
  {
    icon: '⚡',
    title: 'Rapidité',
    description: 'Accédez rapidement à vos mots de passe depuis n\'importe quel appareil.'
  }
];

const Feature = () => {
  return (
    <section className="features">
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Feature;
