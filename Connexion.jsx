import React, { useState } from 'react';
import '../styles/Auth.css';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici vous ajouterez la logique de connexion
    console.log('Connexion avec:', { email, motDePasse });
  };

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-card">
        <h2 className="auth-title">Connexion à l'Annuaire</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="auth-button">
            Se connecter
          </button>

          <div className="auth-links">
            <a href="/mot-de-passe-oublie" className="link">Mot de passe oublié ?</a>
            <p>
              Pas encore de compte ? <a href="/inscription" className="link">S'inscrire</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1a73e8', // Bleu similaire à vos autres pages
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  }
};

export default Connexion;