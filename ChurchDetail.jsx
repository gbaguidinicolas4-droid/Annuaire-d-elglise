import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaCar,
  FaWheelchair,
  FaClock,
  FaPrayingHands,
  FaUsers,
  FaCalendarAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaDirections,
  FaStar,
  FaShareAlt,
  FaPrint,
  FaArrowLeft,
  FaEdit,
  FaExclamationCircle
} from 'react-icons/fa';
import { churchService } from '../services/churchService';
import ReviewList from '../components/ReviewList';
import GoogleMapView from '../components/GoogleMapView';

const ChurchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [userLocation, setUserLocation] = useState(null);
  const [relatedChurches, setRelatedChurches] = useState([]);

  useEffect(() => {
    const fetchChurchDetails = async () => {
      try {
        setLoading(true);
        const data = await churchService.getChurchById(id);
        setChurch(data.data);
        
        // Charger les églises similaires
        const related = await churchService.getAllChurches({
          city: data.data.city,
          denomination: data.data.denomination,
          limit: 4
        });
        setRelatedChurches(related.data || []);
        
      } catch (err) {
        console.error('Erreur:', err);
        setError('Église non trouvée ou erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    // Obtenir la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: 48.8566, lng: 2.3522 }); // Paris par défaut
        }
      );
    }

    fetchChurchDetails();
  }, [id]);

  const handleGetDirections = () => {
    if (church && church.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${church.coordinates.lat},${church.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: church.name,
      text: `Découvrez ${church.name} à ${church.city}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papier !');
      }
    } catch (err) {
      console.error('Erreur de partage:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des détails de l'église...</p>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <h2>{error || 'Église non trouvée'}</h2>
        <p>L'église que vous recherchez n'existe pas ou a été déplacée.</p>
        <button 
          className="btn-primary"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft /> Retour à l'accueil
        </button>
      </div>
    );
  }

  const calculateDistance = () => {
    if (!userLocation || !church.coordinates) return null;
    
    const R = 6371;
    const dLat = (church.coordinates.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (church.coordinates.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(church.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance();

  return (
    <div className="church-detail-page">
      {/* Boutons d'action flottants */}
      <div className="floating-actions">
        <button className="floating-btn" onClick={() => navigate('/')}>
          <FaArrowLeft />
        </button>
        <button className="floating-btn" onClick={handleShare}>
          <FaShareAlt />
        </button>
        <button className="floating-btn" onClick={handlePrint}>
          <FaPrint />
        </button>
        <button className="floating-btn" onClick={handleGetDirections}>
          <FaDirections />
        </button>
      </div>

      {/* En-tête */}
      <div className="church-header">
        <div className="church-header-content">
          <div className="breadcrumb">
            <Link to="/">Accueil</Link> 
            <span> / </span>
            <Link to={`/?city=${church.city}`}>{church.city}</Link>
            <span> / </span>
            <span>{church.name}</span>
          </div>
          
          <div className="church-title-section">
            <h1>{church.name}</h1>
            <div className="church-meta">
              <span className="denomination-badge">{church.denomination}</span>
              <span className="city-badge">{church.city}</span>
              {distance && (
                <span className="distance-badge">
                  <FaMapMarkerAlt /> {distance} km
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container church-detail-container">
        <div className="church-main-content">
          {/* Galerie d'images */}
          {church.images && church.images.length > 0 && (
            <div className="church-gallery">
              <div className="main-image">
                <img 
                  src={church.images[0].url} 
                  alt={church.name}
                />
              </div>
              {church.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {church.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="thumbnail">
                      <img src={image.url} alt={`${church.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglets */}
          <div className="church-tabs">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Informations
              </button>
              <button 
                className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                Horaires
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Avis ({church.reviews?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                Carte
              </button>
            </div>

            <div className="tab-content">
              {/* Onglet Informations */}
              {activeTab === 'info' && (
                <div className="info-tab">
                  <div className="info-grid">
                    <div className="info-section">
                      <h3>
                        <FaMapMarkerAlt className="section-icon" />
                        Adresse
                      </h3>
                      <p className="address">{church.address}</p>
                      <p className="city">{church.city} {church.postalCode}</p>
                      
                      <div className="action-buttons">
                        <button 
                          className="btn-action"
                          onClick={handleGetDirections}
                        >
                          <FaDirections /> Itinéraire
                        </button>
                      </div>
                    </div>

                    <div className="info-section">
                      <h3>
                        <FaPrayingHands className="section-icon" />
                        Responsable
                      </h3>
                      <p className="pastor">{church.pastor}</p>
                      {church.pastorPhone && (
                        <p className="contact-info">
                          <FaPhone /> {church.pastorPhone}
                        </p>
                      )}
                      {church.pastorEmail && (
                        <p className="contact-info">
                          <FaEnvelope /> {church.pastorEmail}
                        </p>
                      )}
                    </div>

                    <div className="info-section">
                      <h3>
                        <FaPhone className="section-icon" />
                        Contact
                      </h3>
                      {church.phone && (
                        <p className="contact-info">
                          <FaPhone /> {church.phone}
                        </p>
                      )}
                      {church.email && (
                        <p className="contact-info">
                          <FaEnvelope /> {church.email}
                        </p>
                      )}
                      {church.website && (
                        <p className="contact-info">
                          <FaGlobe /> 
                          <a 
                            href={church.website.startsWith('http') ? church.website : `https://${church.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {church.website}
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="info-section">
                      <h3>
                        <FaUsers className="section-icon" />
                        Informations pratiques
                      </h3>
                      <div className="practical-info">
                        {church.capacity && (
                          <div className="info-item">
                            <span className="label">Capacité:</span>
                            <span className="value">{church.capacity} places</span>
                          </div>
                        )}
                        {church.yearBuilt && (
                          <div className="info-item">
                            <span className="label">Année de construction:</span>
                            <span className="value">{church.yearBuilt}</span>
                          </div>
                        )}
                        <div className="info-item">
                          <span className="label">Parking:</span>
                          <span className="value">
                            {church.hasParking ? (
                              <><FaCar /> Disponible{church.parkingSpots && ` (${church.parkingSpots} places)`}</>
                            ) : 'Non disponible'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Accessibilité:</span>
                          <span className="value">
                            {church.hasAccessibility ? (
                              <><FaWheelchair /> Accessible aux personnes à mobilité réduite</>
                            ) : 'Non accessible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {church.description && (
                    <div className="description-section">
                      <h3>Description</h3>
                      <p className="description">{church.description}</p>
                    </div>
                  )}

                  {/* Réseaux sociaux */}
                  {church.socialMedia && (
                    <div className="social-section">
                      <h3>Réseaux sociaux</h3>
                      <div className="social-links">
                        {church.socialMedia.facebook && (
                          <a 
                            href={church.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link facebook"
                          >
                            <FaFacebook /> Facebook
                          </a>
                        )}
                        {church.socialMedia.instagram && (
                          <a 
                            href={church.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link instagram"
                          >
                            <FaInstagram /> Instagram
                          </a>
                        )}
                        {church.socialMedia.youtube && (
                          <a 
                            href={church.socialMedia.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link youtube"
                          >
                            <FaYoutube /> YouTube
                          </a>
                        )}
                        {church.socialMedia.twitter && (
                          <a 
                            href={church.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link twitter"
                          >
                            <FaTwitter /> Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Horaires */}
              {activeTab === 'schedule' && (
                <div className="schedule-tab">
                  <h3>Horaires des cultes et services</h3>
                  
                  {church.services && church.services.length > 0 ? (
                    <div className="services-list">
                      {church.services.map((service, index) => (
                        <div key={index} className="service-item">
                          <div className="service-day">{service.day}</div>
                          <div className="service-time">{service.time}</div>
                          <div className="service-type">{service.type}</div>
                          {service.language && (
                            <div className="service-language">
                              Langue: {service.language}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-schedule">
                      Les horaires des cultes ne sont pas renseignés.
                    </p>
                  )}

                  {church.openingHours && (
                    <div className="opening-hours">
                      <h4>Heures d'ouverture</h4>
                      <div className="hours-grid">
                        {Object.entries(church.openingHours).map(([day, hours]) => (
                          <div key={day} className="hour-item">
                            <span className="day">{getDayName(day)}</span>
                            <span className="hours">{hours || 'Fermé'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Avis */}
              {activeTab === 'reviews' && (
                <div className="reviews-tab">
                  <ReviewList churchId={id} />
                </div>
              )}

              {/* Onglet Carte */}
              {activeTab === 'map' && (
                <div className="map-tab">
                  <div className="map-container">
                    <GoogleMapView
                      churches={[church]}
                      selectedChurch={church}
                      userLocation={userLocation}
                    />
                  </div>
                  <div className="map-info">
                    <h4>Localisation</h4>
                    <p>{church.address}</p>
                    <p>{church.city} {church.postalCode}</p>
                    <button 
                      className="btn-primary"
                      onClick={handleGetDirections}
                    >
                      <FaDirections /> Obtenir l'itinéraire
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="church-sidebar">
          {/* Actions rapides */}
          <div className="sidebar-section quick-actions">
            <h3>Actions rapides</h3>
            <button className="sidebar-btn">
              <FaPhone /> Appeler
            </button>
            <button className="sidebar-btn" onClick={handleGetDirections}>
              <FaDirections /> Itinéraire
            </button>
            <button className="sidebar-btn" onClick={handleShare}>
              <FaShareAlt /> Partager
            </button>
            <button className="sidebar-btn">
              <FaEnvelope /> Contacter
            </button>
          </div>

          {/* Églises similaires */}
          {relatedChurches.length > 0 && (
            <div className="sidebar-section related-churches">
              <h3>Églises similaires</h3>
              <div className="related-list">
                {relatedChurches
                  .filter(c => c.id !== church.id)
                  .slice(0, 3)
                  .map(relatedChurch => (
                    <div 
                      key={relatedChurch.id} 
                      className="related-item"
                      onClick={() => navigate(`/eglise/${relatedChurch.id}`)}
                    >
                      <h4>{relatedChurch.name}</h4>
                      <p>{relatedChurch.address}</p>
                      <p className="distance">
                        {relatedChurch.distance ? `${relatedChurch.distance} km` : ''}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="sidebar-section statistics">
            <h3>Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{church.metadata?.views || 0}</div>
                <div className="stat-label">Vues</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{church.reviews?.length || 0}</div>
                <div className="stat-label">Avis</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {church.hasParking ? 'Oui' : 'Non'}
                </div>
                <div className="stat-label">Parking</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {church.hasAccessibility ? 'Oui' : 'Non'}
                </div>
                <div className="stat-label">Accessibilité</div>
              </div>
            </div>
          </div>

          {/* Information de vérification */}
          {church.isVerified && (
            <div className="sidebar-section verification">
              <h3>
                <FaStar className="verified-icon" />
                Vérifiée
              </h3>
              <p>Cette église a été vérifiée par notre équipe.</p>
              {church.verificationDate && (
                <p className="verification-date">
                  Vérifiée le {new Date(church.verificationDate).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour les noms de jours
const getDayName = (dayKey) => {
  const days = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };
  return days[dayKey] || dayKey;
};

export default ChurchDetail;