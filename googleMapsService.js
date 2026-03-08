export const loadGoogleMapsScript = (callback) => {
  if (window.google) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
  script.async = true;
  script.defer = true;
  script.onload = () => callback();
  script.onerror = () => console.error('Erreur de chargement Google Maps');
  document.head.appendChild(script);
};

export const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formattedAddress: results[0].formatted_address
        });
      } else {
        reject(`Geocoding failed: ${status}`);
      }
    });
  });
};

export const calculateDistance = (origin, destination) => {
  const service = new window.google.maps.DistanceMatrixService();
  
  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          resolve(response.rows[0].elements[0]);
        } else {
          reject(`Distance calculation failed: ${status}`);
        }
      }
    );
  });
};