import React, { useState, useCallback, useRef } from 'react';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  Circle,
  DirectionsRenderer
} from '@react-google-maps/api';
import { 
  FaChurch, 
  FaCar, 
  FaPhone, 
  FaMapMarkerAlt,
  FaDirections 
} from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '10px'
};

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
};

const GoogleMapView = ({ 
  churches, 
  selectedChurch, 
  onSelectChurch,
  userLocation,
  filters 
}) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const mapRef = useRef();

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  const getDirections = (church) => {
    if (!userLocation) {
      alert("Veuillez autoriser la géolocalisation pour obtenir l'itinéraire");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userLocation,
        destination: church.coordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          onSelectChurch(church);
        } else {
          console.error(`Erreur d'itinéraire: ${status}`);
        }
      }
    );
  };

  const getChurchIcon = (denomination) => {
    const colors = {
      'Catholique': '#FF5252',
      'Protestante': '#2196F3',
      'Orthodoxe': '#4CAF50',
      'Pentecôtiste': '#FF9800',
      'Évangélique': '#9C27B0',
      'Autre': '#607D8B'
    };
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: colors[denomination] || '#607D8B',
      fillOpacity: 0.8,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 10
    };
  };

  const mapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedChurch?.coordinates || userLocation || defaultCenter}
        zoom={selectedChurch ? 15 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Localisation de l'utilisateur */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 8
              }}
              title="Votre position"
            />
            <Circle
              center={userLocation}
              radius={5000} // 5km
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3,
                strokeWeight: 2
              }}
            />
          </>
        )}

        {/* Marqueurs des églises */}
        {churches.map((church) => (
          <Marker
            key={church.id}
            position={church.coordinates}
            icon={getChurchIcon(church.denomination)}
            onClick={() => {
              onSelectChurch(church);
              setActiveInfoWindow(church.id);
            }}
            title={church.name}
          />
        ))}

        {/* InfoWindow pour l'église sélectionnée */}
        {selectedChurch && activeInfoWindow === selectedChurch.id && (
          <InfoWindow
            position={selectedChurch.coordinates}
            onCloseClick={() => setActiveInfoWindow(null)}
          >
            <div className="info-window">
              <h4>{selectedChurch.name}</h4>
              <p className="denomination">{selectedChurch.denomination}</p>
              <p>{selectedChurch.address}</p>
              <p><FaPhone /> {selectedChurch.phone}</p>
              <div className="info-window-actions">
                <button 
                  className="btn-directions"
                  onClick={() => getDirections(selectedChurch)}
                >
                  <FaDirections /> Itinéraire
                </button>
                <button 
                  className="btn-details"
                  onClick={() => window.location.href = `/eglise/${selectedChurch.id}`}
                >
                  Détails
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Affichage de l'itinéraire */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {/* Légende */}
      <div className="map-legend">
        <h4>Légende</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#FF5252'}}></div>
            <span>Catholique</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#2196F3'}}></div>
            <span>Protestante</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#4CAF50'}}></div>
            <span>Orthodoxe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#4285F4'}}></div>
            <span>Votre position</span>
          </div>
        </div>
      </div>

      {/* Contrôles de la carte */}
      <div className="map-controls">
        <button 
          className="btn-map-control"
          onClick={() => {
            if (map && userLocation) {
              map.panTo(userLocation);
              map.setZoom(15);
            }
          }}
        >
          <FaMapMarkerAlt /> Me localiser
        </button>
        <button 
          className="btn-map-control"
          onClick={() => {
            if (map && churches.length > 0) {
              const bounds = new window.google.maps.LatLngBounds();
              churches.forEach(church => {
                bounds.extend(church.coordinates);
              });
              if (userLocation) bounds.extend(userLocation);
              map.fitBounds(bounds);
            }
          }}
        >
          Voir tout
        </button>
      </div>
    </div>
  );
};

export default React.memo(GoogleMapView);