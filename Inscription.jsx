import React, { useState } from 'react';
import '../styles/Auth.css';

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmationMotDePasse: '',
    eglise: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.motDePasse !== formData.confirmationMotDePasse) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    // Ici vous ajouterez la logique d'inscription
    console.log('Inscription avec:', formData);
  };

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Votre prénom"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eglise">Église</label>
            <input
              type="text"
              id="eglise"
              value={formData.eglise}
              onChange={handleChange}
              placeholder="Nom de votre église"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="motDePasse">Mot de passe</label>
              <input
                type="password"
                id="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="Créez un mot de passe"
                required
                className="form-input"
              />
            </div>
      
            <div className="form-group half">
              <label htmlFor="confirmationMotDePasse">Confirmation</label>
              <input
                type="password"
                id="confirmationMotDePasse"
                value={formData.confirmationMotDePasse}
                onChange={handleChange}
                placeholder="Confirmez le mot de passe"
                required
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="auth-button">
            S'inscrire
          </button>

          <div className="auth-links">
            <p>
              Déjà un compte ? <a href="/connexion" className="link"> Se connecter  </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1a73e8',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  }
};

export default Inscription;