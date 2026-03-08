import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ChurchDetail from './pages/ChurchDetail';
import AddChurchPage from './pages/AddChurchPage';
import Connexion from './components/Connexion';
import Inscription from "./components/Inscription";
import './styles/App.css';
import {
  FaHome,
  FaPlusCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaPaperPlane,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa';

function App() {
  const [churches, setChurches] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Charger les données initiales
    loadChurches();
    
    // Obtenir la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          // Position par défaut (Paris)
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
        }
      );
    }
  }, []);

  const loadChurches = async () => {
    // Ici, vous pouvez faire un appel API
    const mockData = [
      {
        id: 1,
        name: "Cathédrale Notre-Dame de Paris",
        denomination: "Catholique",
        pastor: "Monseigneur Laurent Ulrich",
        address: "6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris",
        city: "Paris",
        postalCode: "75004",
        phone: "01 42 34 56 10",
        email: "contact@notredamedeparis.fr",
        website: "https://www.notredamedeparis.fr",
        services: ["Messe: Dimanche 10h", "Messe: Dimanche 18h30", "Messe en semaine: 8h"],
        coordinates: { lat: 48.852968, lng: 2.349902 },
        hasParking: true,
        capacity: 9000,
        yearBuilt: 1163,
        description: "Cathédrale emblématique de style gothique",
        images: ["notredame.jpg"],
        openingHours: {
          monday: "8:00-18:45",
          tuesday: "8:00-18:45",
          wednesday: "8:00-18:45",
          thursday: "8:00-18:45",
          friday: "8:00-18:45",
          saturday: "8:00-18:45",
          sunday: "8:00-18:45"
        }
      },
      {
        id: 2,
        name: "Église Saint-Sulpice",
        denomination: "Catholique",
        pastor: "Père Jean-Luc Brunin",
        address: "2 Rue Palatine, 75006 Paris",
        city: "Paris",
        postalCode: "75006",
        phone: "01 42 34 59 98",
        email: "accueil@saint-sulpice.com",
        website: "https://www.saint-sulpice.com",
        services: ["Messe: Dimanche 9h", "Messe: Dimanche 11h", "Messe: Samedi 18h30"],
        coordinates: { lat: 48.851102, lng: 2.334644 },
        hasParking: false,
        capacity: 5000,
        description: "Deuxième plus grande église de Paris",
        images: ["saintsulpice.jpg"]
      },
      {
        id: 3,
        name: "Église Protestante Unie de l'Étoile",
        denomination: "Protestante",
        pastor: "Pasteur Marie Durand",
        address: "54 Avenue de la Grande Armée, 75017 Paris",
        city: "Paris",
        postalCode: "75017",
        phone: "01 43 80 20 43",
        email: "contact@eglisedeletoile.fr",
        website: "https://www.eglisedeletoile.fr",
        services: ["Culte: Dimanche 10h30", "Étude biblique: Mercredi 19h"],
        coordinates: { lat: 48.875487, lng: 2.293614 },
        hasParking: true,
        capacity: 800,
        yearBuilt: 1874
      },
      {
        id: 4,
        name: "Église Orthodoxe Saint-Serge",
        denomination: "Orthodoxe",
        pastor: "Père Nicolas Cernokrak",
        address: "93 Rue de Crimée, 75019 Paris",
        city: "Paris",
        postalCode: "75019",
        phone: "01 42 01 96 46",
        services: ["Divine Liturgie: Dimanche 10h", "Vêpres: Samedi 18h"],
        coordinates: { lat: 48.881234, lng: 2.378890 },
        hasParking: false,
        capacity: 300
      },
      {
        id: 5,
        name: "Temple du Saint-Esprit",
        denomination: "Pentecôtiste",
        pastor: "Pasteur Samuel Kouassi",
        address: "12 Rue des Entrepreneurs, 92150 Suresnes",
        city: "Suresnes",
        postalCode: "92150",
        phone: "01 47 72 56 34",
        email: "info@temple-saint-esprit.fr",
        services: ["Culte: Dimanche 10h", "Prières: Mardi 19h", "Jeûne: Vendredi"],
        coordinates: { lat: 48.871234, lng: 2.228890 },
        hasParking: true,
        capacity: 1200
      }
    ];
    setChurches(mockData);
  };

  const addChurch = (newChurch) => {
    setChurches([...churches, { ...newChurch, id: churches.length + 1 }]);
  };

  return (
    <GoogleOAuthProvider clientId="votre_client_id_google_auth">
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomePage 
                    churches={churches}
                    userLocation={userLocation}
                  />
                } 
              />
              <Route 
                path="/eglise/:id" 
                element={<ChurchDetail churches={churches} />} 
              />
              <Route 
                path="/ajouter-eglise" 
                element={<AddChurchPage addChurch={addChurch} />} 
              />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />


            </Routes>
            
          </main>
          
<footer className="footer">
  <div className="container">
    <div className="footer-top">
      <div className="footer-grid">
        <div className="footer-column">
          <h3>Annuaire des Églises</h3>
          <p>Trouvez l'église la plus proche de chez vous et rejoignez une communauté.</p>
          <div className="footer-social">
            <a href="#" className="social-link" title="Facebook">
              <FaFacebook />
            </a>
            <a href="#" className="social-link" title="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="social-link" title="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-link" title="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3>Liens rapides</h3>
          <ul className="footer-links">
            <li><a href="/"><FaHome /> Accueil</a></li>
            <li><a href="/ajouter-eglise"><FaPlusCircle /> Ajouter une église</a></li>
            <li><a href="/#map"><FaMapMarkerAlt /> Carte interactive</a></li>
            <li><a href="/recherche"><FaSearch /> Recherche avancée</a></li>
            <li><a href="/contact"><FaEnvelope /> Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Contact</h3>
          <div className="footer-contact">
            <div className="contact-item">
              <FaPhone className="icon" />
              <span>01 23 45 67 89</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="icon" />
              <span>contact@annuaire-eglises.fr</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="icon" />
              <span>123 Rue de l'Église, 75001 Paris</span>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <p>Inscrivez-vous à notre newsletter</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                className="newsletter-input" 
                placeholder="Votre email"
                required
              />
              <button type="submit" className="newsletter-btn">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <div className="footer-bottom">
      <div className="footer-bottom-content">
        <div className="footer-copyright">
          © {new Date().getFullYear()} Annuaire des Églises. Tous droits réservés.
        </div>
        <div className="footer-legal">
          <div className="footer-legal-links">
            <a href="/confidentialite">Confidentialité</a>
            <a href="/conditions">Conditions d'utilisation</a>
            <a href="/mentions-legales">Mentions légales</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;