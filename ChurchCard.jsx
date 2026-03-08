import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaCar,
  FaPray,
  FaUsers,
  FaCalendarAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChurchCard = ({ church, userLocation, onGetDirections }) => {
  const navigate = useNavigate();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return null;
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = userLocation 
    ? calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        church.coordinates.lat, 
        church.coordinates.lng
      )
    : null;

  const getDenominationColor = (denomination) => {
    const colors = {
      'Catholique': '#FF5252',
      'Protestante': '#2196F3',
      'Orthodoxe': '#4CAF50',
      'Pentecôtiste': '#FF9800',
      'Évangélique': '#9C27B0',
      'Autre': '#607D8B'
    };
    return colors[denomination] || '#607D8B';
  };

  return (
    <div className="church-card">
      <div 
        className="church-header"
        style={{ backgroundColor: getDenominationColor(church.denomination) }}
      >
        <h3>{church.name}</h3>
        <span className="church-distance">
          {distance ? `${distance} km` : ''}
        </span>
      </div>
      
      <div className="church-body">
        <div className="church-info">
          <div className="info-row">
            <FaMapMarkerAlt className="icon" />
            <div>
              <p className="address">{church.address}</p>
              <p className="city">{church.city} {church.postalCode}</p>
            </div>
          </div>
          
          <div className="info-row">
            <FaPray className="icon" />
            <div>
              <p className="pastor"><strong>Responsable:</strong> {church.pastor}</p>
              <p className="denomination-tag">{church.denomination}</p>
            </div>
          </div>
          
          {church.phone && (
            <div className="info-row">
              <FaPhone className="icon" />
              <p>{church.phone}</p>
            </div>
          )}
          
          {church.capacity && (
            <div className="info-row">
              <FaUsers className="icon" />
              <p>Capacité: {church.capacity} places</p>
            </div>
          )}
          
          {church.hasParking && (
            <div className="info-row">
              <FaCar className="icon" />
              <p>Parking disponible</p>
            </div>
          )}
          
          {church.services && church.services.length > 0 && (
            <div className="info-row">
              <FaCalendarAlt className="icon" />
              <div>
                <p><strong>Horaires des cultes:</strong></p>
                <ul className="services-list">
                  {church.services.slice(0, 2).map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="church-actions">
          <button 
            className="btn-action btn-details"
            onClick={() => navigate(`/eglise/${church.id}`)}
          >
            Voir détails
          </button>
          <button 
            className="btn-action btn-directions"
            onClick={() => onGetDirections(church)}
            disabled={!userLocation}
          >
            <FaMapMarkerAlt /> Itinéraire
          </button>
          <button 
            className="btn-action btn-share"
            onClick={() => {
              navigator.clipboard.writeText(
                `${church.name}\n${church.address}\n${church.phone}`
              );
              alert('Informations copiées dans le presse-papier');
            }}
          >
            Partager
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChurchCard;