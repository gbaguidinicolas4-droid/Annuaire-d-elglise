import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaChurch, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaUserPlus,
  FaBars,
  FaTimes 
} from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <FaChurch className="logo-icon" />
          <div className="logo-text">
            <h1>Annuaire des Églises</h1>
            <p>Trouvez l'église la plus proche de chez vous</p>
          </div>
        </div>

        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <FaSearch /> Rechercher
              </Link>
            </li>
            <li>
              <Link to="/#map" onClick={() => setIsMenuOpen(false)}>
                <FaMapMarkerAlt /> Carte
              </Link>
            </li>
            <li>
              <Link to="/ajouter-eglise" onClick={() => setIsMenuOpen(false)}>
                <FaUserPlus /> Ajouter une église
              </Link>
            </li>
            <li>
              <Link to="/connexion" onClick={() => setIsMenuOpen(false)}>
                    Connexion
              </Link>
            </li>

            <li>
              <Link to="/isnscription" onClick={() => setIsMenuOpen(false)}>
                 Inscription
              </Link>
            </li>
          </ul>
          
        
        </nav>
      </div>
      
      <div className="header-stats">
        <div className="stat">
          <span className="stat-number">500+</span>
          <span className="stat-label">Églises</span>
        </div>
        <div className="stat">
          <span className="stat-number">50+</span>
          <span className="stat-label">Villes</span>
        </div>
        <div className="stat">
          <span className="stat-number">15+</span>
          <span className="stat-label">Dénominations</span>
        </div>
      </div>
    </header>
  );
};

export default Header;