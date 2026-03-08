import validator from 'validator';

export const churchValidator = {
  // Valider toutes les données de l'église
  validateChurch: (churchData) => {
    const errors = {};
    
    // Informations de base
    errors.name = churchValidator.validateName(churchData.name);
    errors.denomination = churchValidator.validateDenomination(churchData.denomination);
    errors.pastor = churchValidator.validatePastor(churchData.pastor);
    errors.address = churchValidator.validateAddress(churchData.address);
    errors.city = churchValidator.validateCity(churchData.city);
    errors.postalCode = churchValidator.validatePostalCode(churchData.postalCode);
    
    // Coordonnées
    errors.coordinates = churchValidator.validateCoordinates(churchData.coordinates);
    
    // Informations de contact
    if (churchData.email) errors.email = churchValidator.validateEmail(churchData.email);
    if (churchData.phone) errors.phone = churchValidator.validatePhone(churchData.phone);
    if (churchData.website) errors.website = churchValidator.validateWebsite(churchData.website);
    if (churchData.pastorEmail) errors.pastorEmail = churchValidator.validateEmail(churchData.pastorEmail);
    if (churchData.pastorPhone) errors.pastorPhone = churchValidator.validatePhone(churchData.pastorPhone);
    
    // Informations supplémentaires
    if (churchData.capacity) errors.capacity = churchValidator.validateCapacity(churchData.capacity);
    if (churchData.yearBuilt) errors.yearBuilt = churchValidator.validateYearBuilt(churchData.yearBuilt);
    if (churchData.parkingSpots) errors.parkingSpots = churchValidator.validateParkingSpots(churchData.parkingSpots);
    
    // Services
    if (churchData.services && churchData.services.length > 0) {
      errors.services = churchValidator.validateServices(churchData.services);
    }
    
    // Images
    if (churchData.images && churchData.images.length > 0) {
      errors.images = churchValidator.validateImages(churchData.images);
    }
    
    // Filtrer les erreurs nulles
    return Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== null)
    );
  },
  
  // Validation individuelle des champs
  
  validateName: (name) => {
    if (!name || name.trim().length === 0) {
      return 'Le nom de l\'église est requis';
    }
    
    if (name.length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (name.length > 100) {
      return 'Le nom ne peut pas dépasser 100 caractères';
    }
    
    const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-\'\.\(\)]+$/;
    if (!nameRegex.test(name)) {
      return 'Le nom contient des caractères non autorisés';
    }
    
    return null;
  },
  
  validateDenomination: (denomination) => {
    if (!denomination) {
      return 'La dénomination est requise';
    }
    
    const validDenominations = [
      'Catholique', 
      'Protestante', 
      'Orthodoxe', 
      'Pentecôtiste', 
      'Évangélique', 
      'Autre'
    ];
    
    if (!validDenominations.includes(denomination)) {
      return 'Dénomination non valide';
    }
    
    return null;
  },
  
  validatePastor: (pastor) => {
    if (!pastor || pastor.trim().length === 0) {
      return 'Le nom du responsable est requis';
    }
    
    if (pastor.length < 2) {
      return 'Le nom du responsable doit contenir au moins 2 caractères';
    }
    
    if (pastor.length > 50) {
      return 'Le nom du responsable ne peut pas dépasser 50 caractères';
    }
    
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-\'\.]+$/;
    if (!nameRegex.test(pastor)) {
      return 'Le nom du responsable contient des caractères non autorisés';
    }
    
    return null;
  },
  
  validateAddress: (address) => {
    if (!address || address.trim().length === 0) {
      return 'L\'adresse est requise';
    }
    
    if (address.length < 5) {
      return 'L\'adresse doit contenir au moins 5 caractères';
    }
    
    if (address.length > 200) {
      return 'L\'adresse ne peut pas dépasser 200 caractères';
    }
    
    return null;
  },
  
  validateCity: (city) => {
    if (!city || city.trim().length === 0) {
      return 'La ville est requise';
    }
    
    if (city.length < 2) {
      return 'La ville doit contenir au moins 2 caractères';
    }
    
    if (city.length > 50) {
      return 'La ville ne peut pas dépasser 50 caractères';
    }
    
    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-\']+$/;
    if (!cityRegex.test(city)) {
      return 'Le nom de la ville contient des caractères non autorisés';
    }
    
    return null;
  },
  
  validatePostalCode: (postalCode) => {
    if (!postalCode || postalCode.trim().length === 0) {
      return 'Le code postal est requis';
    }
    
    const frenchPostalCodeRegex = /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/;
    if (!frenchPostalCodeRegex.test(postalCode.replace(/\s/g, ''))) {
      return 'Code postal français non valide';
    }
    
    return null;
  },
  
  validateCoordinates: (coordinates) => {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return 'Les coordonnées GPS sont requises';
    }
    
    if (!validator.isLatLong(`${coordinates.lat},${coordinates.lng}`)) {
      return 'Coordonnées GPS non valides';
    }
    
    // Vérifier si les coordonnées sont en France (approximatif)
    const { lat, lng } = coordinates;
    if (lat < 41 || lat > 51.5 || lng < -5 || lng > 10) {
      return 'Les coordonnées doivent être en France';
    }
    
    return null;
  },
  
  validateEmail: (email) => {
    if (!email || email.trim().length === 0) {
      return null; // Email optionnel
    }
    
    if (!validator.isEmail(email)) {
      return 'Format d\'email non valide';
    }
    
    if (email.length > 100) {
      return 'L\'email ne peut pas dépasser 100 caractères';
    }
    
    return null;
  },
  
  validatePhone: (phone) => {
    if (!phone || phone.trim().length === 0) {
      return null; // Téléphone optionnel
    }
    
    // Nettoyer le numéro
    const cleanPhone = phone.replace(/\s/g, '').replace(/\./g, '');
    
    // Format français
    const frenchPhoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!frenchPhoneRegex.test(cleanPhone)) {
      return 'Numéro de téléphone français non valide';
    }
    
    return null;
  },
  
  validateWebsite: (website) => {
    if (!website || website.trim().length === 0) {
      return null; // Site web optionnel
    }
    
    if (!validator.isURL(website, { 
      require_protocol: false,
      require_valid_protocol: true,
      protocols: ['http', 'https']
    })) {
      return 'URL du site web non valide';
    }
    
    if (website.length > 200) {
      return 'L\'URL ne peut pas dépasser 200 caractères';
    }
    
    return null;
  },
  
  validateCapacity: (capacity) => {
    if (!capacity) return null;
    
    const num = parseInt(capacity, 10);
    
    if (isNaN(num)) {
      return 'La capacité doit être un nombre';
    }
    
    if (num < 0) {
      return 'La capacité ne peut pas être négative';
    }
    
    if (num > 100000) {
      return 'La capacité est trop élevée';
    }
    
    return null;
  },
  
  validateYearBuilt: (year) => {
    if (!year) return null;
    
    const num = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(num)) {
      return 'L\'année doit être un nombre';
    }
    
    if (num < 1000 || num > currentYear) {
      return `L'année doit être entre 1000 et ${currentYear}`;
    }
    
    return null;
  },
  
  validateParkingSpots: (spots) => {
    if (!spots) return null;
    
    const num = parseInt(spots, 10);
    
    if (isNaN(num)) {
      return 'Le nombre de places doit être un nombre';
    }
    
    if (num < 0) {
      return 'Le nombre de places ne peut pas être négatif';
    }
    
    if (num > 10000) {
      return 'Le nombre de places est trop élevé';
    }
    
    return null;
  },
  
  validateServices: (services) => {
    if (!Array.isArray(services)) {
      return 'Les services doivent être un tableau';
    }
    
    if (services.length > 50) {
      return 'Maximum 50 services autorisés';
    }
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      
      if (!service.day || service.day.trim().length === 0) {
        return `Service ${i + 1}: Le jour est requis`;
      }
      
      if (!service.time || service.time.trim().length === 0) {
        return `Service ${i + 1}: L'heure est requise`;
      }
      
      // Valider le format de l'heure
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(service.time)) {
        return `Service ${i + 1}: Format d'heure invalide (HH:MM)`;
      }
      
      if (service.type && service.type.length > 50) {
        return `Service ${i + 1}: Le type ne peut pas dépasser 50 caractères`;
      }
      
      if (service.language && service.language.length > 30) {
        return `Service ${i + 1}: La langue ne peut pas dépasser 30 caractères`;
      }
    }
    
    return null;
  },
  
  validateImages: (images) => {
    if (!Array.isArray(images)) {
      return 'Les images doivent être un tableau';
    }
    
    if (images.length > 10) {
      return 'Maximum 10 images autorisées';
    }
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (!image.url || image.url.trim().length === 0) {
        return `Image ${i + 1}: L'URL est requise`;
      }
      
      if (image.caption && image.caption.length > 200) {
        return `Image ${i + 1}: La légende ne peut pas dépasser 200 caractères`;
      }
    }
    
    return null;
  },
  
  validateOpeningHours: (hours) => {
    if (!hours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      if (hours[day] && hours[day].length > 50) {
        return `Les horaires du ${day} sont trop longs`;
      }
    }
    
    return null;
  },
  
  validateSocialMedia: (socialMedia) => {
    if (!socialMedia) return null;
    
    const platforms = ['facebook', 'instagram', 'youtube', 'twitter'];
    
    for (const platform of platforms) {
      if (socialMedia[platform]) {
        if (!validator.isURL(socialMedia[platform], { 
          require_protocol: true,
          require_valid_protocol: true,
          protocols: ['http', 'https']
        })) {
          return `URL ${platform} non valide`;
        }
        
        if (socialMedia[platform].length > 200) {
          return `L'URL ${platform} ne peut pas dépasser 200 caractères`;
        }
      }
    }
    
    return null;
  },
  
  validateDescription: (description) => {
    if (!description) return null;
    
    if (description.length > 2000) {
      return 'La description ne peut pas dépasser 2000 caractères';
    }
    
    return null;
  },
  
  // Validation pour le formulaire étape par étape
  validateStep: (step, data) => {
    const errors = {};
    
    switch (step) {
      case 1: // Informations de base
        errors.name = churchValidator.validateName(data.name);
        errors.denomination = churchValidator.validateDenomination(data.denomination);
        errors.pastor = churchValidator.validatePastor(data.pastor);
        errors.address = churchValidator.validateAddress(data.address);
        errors.city = churchValidator.validateCity(data.city);
        errors.postalCode = churchValidator.validatePostalCode(data.postalCode);
        break;
        
      case 2: // Coordonnées et contact
        errors.coordinates = churchValidator.validateCoordinates(data.coordinates);
        if (data.email) errors.email = churchValidator.validateEmail(data.email);
        if (data.phone) errors.phone = churchValidator.validatePhone(data.phone);
        if (data.website) errors.website = churchValidator.validateWebsite(data.website);
        break;
        
      case 3: // Services
        if (data.services && data.services.length > 0) {
          errors.services = churchValidator.validateServices(data.services);
        }
        break;
        
      case 4: // Informations supplémentaires
        if (data.capacity) errors.capacity = churchValidator.validateCapacity(data.capacity);
        if (data.yearBuilt) errors.yearBuilt = churchValidator.validateYearBuilt(data.yearBuilt);
        if (data.description) errors.description = churchValidator.validateDescription(data.description);
        break;
    }
    
    // Filtrer les erreurs nulles
    return Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== null)
    );
  },
  
  // Valider l'adresse complète
  validateFullAddress: (address, city, postalCode) => {
    const errors = {};
    
    errors.address = churchValidator.validateAddress(address);
    errors.city = churchValidator.validateCity(city);
    errors.postalCode = churchValidator.validatePostalCode(postalCode);
    
    return Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== null)
    );
  },
  
  // Valider les informations de contact
  validateContactInfo: (phone, email, website) => {
    const errors = {};
    
    if (phone) errors.phone = churchValidator.validatePhone(phone);
    if (email) errors.email = churchValidator.validateEmail(email);
    if (website) errors.website = churchValidator.validateWebsite(website);
    
    return Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== null)
    );
  },
  
  // Vérifier si l'église est complète (prête pour publication)
  isChurchComplete: (churchData) => {
    const requiredFields = [
      'name',
      'denomination',
      'pastor',
      'address',
      'city',
      'postalCode',
      'coordinates'
    ];
    
    for (const field of requiredFields) {
      if (!churchData[field] || 
          (typeof churchData[field] === 'object' && 
           !churchData[field].lat && !churchData[field].lng)) {
        return false;
      }
    }
    
    // Vérifier au moins un service
    if (!churchData.services || churchData.services.length === 0) {
      return false;
    }
    
    // Vérifier au moins une image
    if (!churchData.images || churchData.images.length === 0) {
      return false;
    }
    
    return true;
  },
  
  // Nettoyer les données avant sauvegarde
  sanitizeChurchData: (churchData) => {
    const sanitized = { ...churchData };
    
    // Nettoyer les chaînes de caractères
    const stringFields = [
      'name', 'denomination', 'pastor', 'address', 'city', 
      'postalCode', 'region', 'phone', 'email', 'website',
      'description', 'pastorEmail', 'pastorPhone'
    ];
    
    stringFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitized[field].trim();
      }
    });
    
    // Nettoyer les coordonnées
    if (sanitized.coordinates) {
      sanitized.coordinates = {
        lat: parseFloat(sanitized.coordinates.lat).toFixed(6),
        lng: parseFloat(sanitized.coordinates.lng).toFixed(6)
      };
    }
    
    // Nettoyer les nombres
    const numberFields = ['capacity', 'yearBuilt', 'parkingSpots'];
    numberFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = parseInt(sanitized[field], 10);
      }
    });
    
    // Nettoyer les services
    if (sanitized.services && Array.isArray(sanitized.services)) {
      sanitized.services = sanitized.services.map(service => ({
        day: service.day ? service.day.trim() : '',
        time: service.time ? service.time.trim() : '',
        type: service.type ? service.type.trim() : '',
        language: service.language ? service.language.trim() : ''
      })).filter(service => service.day && service.time); // Supprimer les services incomplets
    }
    
    // Nettoyer les images
    if (sanitized.images && Array.isArray(sanitized.images)) {
      sanitized.images = sanitized.images.map(image => ({
        url: image.url ? image.url.trim() : '',
        caption: image.caption ? image.caption.trim() : '',
        isMain: Boolean(image.isMain)
      })).filter(image => image.url); // Supprimer les images sans URL
    }
    
    // Nettoyer les réseaux sociaux
    if (sanitized.socialMedia) {
      Object.keys(sanitized.socialMedia).forEach(platform => {
        if (sanitized.socialMedia[platform]) {
          sanitized.socialMedia[platform] = sanitized.socialMedia[platform].trim();
        }
      });
    }
    
    // Nettoyer les horaires d'ouverture
    if (sanitized.openingHours) {
      Object.keys(sanitized.openingHours).forEach(day => {
        if (sanitized.openingHours[day]) {
          sanitized.openingHours[day] = sanitized.openingHours[day].trim();
        }
      });
    }
    
    return sanitized;
  },
  
  // Formatage des erreurs pour l'affichage
  formatErrors: (errors) => {
    if (Object.keys(errors).length === 0) {
      return [];
    }
    
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message,
      type: 'error'
    }));
  },
  
  // Valider les coordonnées GPS
  validateCoordinatesFormat: (lat, lng) => {
    const errors = [];
    
    if (!lat || isNaN(lat)) {
      errors.push('La latitude est requise et doit être un nombre');
    } else if (lat < -90 || lat > 90) {
      errors.push('La latitude doit être entre -90 et 90');
    }
    
    if (!lng || isNaN(lng)) {
      errors.push('La longitude est requise et doit être un nombre');
    } else if (lng < -180 || lng > 180) {
      errors.push('La longitude doit être entre -180 et 180');
    }
    
    return errors;
  },
  
  // Valider les limites géographiques (France)
  validateFranceLocation: (lat, lng) => {
    // Coordonnées approximatives de la France métropolitaine
    const franceBounds = {
      minLat: 41.0,
      maxLat: 51.5,
      minLng: -5.0,
      maxLng: 10.0
    };
    
    if (lat < franceBounds.minLat || lat > franceBounds.maxLat ||
        lng < franceBounds.minLng || lng > franceBounds.maxLng) {
      return 'Les coordonnées doivent être en France métropolitaine';
    }
    
    return null;
  }
};

// Export pour une utilisation avec les formulaires React
export const churchValidationRules = {
  name: {
    required: 'Le nom est requis',
    minLength: {
      value: 2,
      message: 'Minimum 2 caractères'
    },
    maxLength: {
      value: 100,
      message: 'Maximum 100 caractères'
    },
    pattern: {
      value: /^[a-zA-ZÀ-ÿ0-9\s\-\'\.\(\)]+$/,
      message: 'Caractères non autorisés'
    }
  },
  
  denomination: {
    required: 'La dénomination est requise',
    validate: (value) => {
      const valid = ['Catholique', 'Protestante', 'Orthodoxe', 'Pentecôtiste', 'Évangélique', 'Autre'];
      return valid.includes(value) || 'Dénomination non valide';
    }
  },
  
  pastor: {
    required: 'Le responsable est requis',
    minLength: {
      value: 2,
      message: 'Minimum 2 caractères'
    },
    maxLength: {
      value: 50,
      message: 'Maximum 50 caractères'
    },
    pattern: {
      value: /^[a-zA-ZÀ-ÿ\s\-\'\.]+$/,
      message: 'Caractères non autorisés'
    }
  },
  
  address: {
    required: 'L\'adresse est requise',
    minLength: {
      value: 5,
      message: 'Minimum 5 caractères'
    },
    maxLength: {
      value: 200,
      message: 'Maximum 200 caractères'
    }
  },
  
  city: {
    required: 'La ville est requise',
    minLength: {
      value: 2,
      message: 'Minimum 2 caractères'
    },
    maxLength: {
      value: 50,
      message: 'Maximum 50 caractères'
    },
    pattern: {
      value: /^[a-zA-ZÀ-ÿ\s\-\']+$/,
      message: 'Caractères non autorisés'
    }
  },
  
  postalCode: {
    required: 'Le code postal est requis',
    pattern: {
      value: /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/,
      message: 'Code postal français non valide'
    }
  },
  
  email: {
    required: false,
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Format d\'email non valide'
    },
    maxLength: {
      value: 100,
      message: 'Maximum 100 caractères'
    }
  },
  
  phone: {
    required: false,
    pattern: {
      value: /^(?:(?:\+|00)33|0)[1-9]\d{8}$/,
      message: 'Numéro de téléphone français non valide'
    }
  },
  
  website: {
    required: false,
    pattern: {
      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: 'URL non valide'
    },
    maxLength: {
      value: 200,
      message: 'Maximum 200 caractères'
    }
  },
  
  capacity: {
    required: false,
    min: {
      value: 0,
      message: 'Ne peut pas être négatif'
    },
    max: {
      value: 100000,
      message: 'Valeur trop élevée'
    }
  },
  
  yearBuilt: {
    required: false,
    min: {
      value: 1000,
      message: 'Année trop ancienne'
    },
    max: {
      value: new Date().getFullYear(),
      message: 'Année dans le futur'
    }
  },
  
  parkingSpots: {
    required: false,
    min: {
      value: 0,
      message: 'Ne peut pas être négatif'
    },
    max: {
      value: 10000,
      message: 'Valeur trop élevée'
    }
  }
};

// Hook personnalisé pour la validation React
export const useChurchValidation = () => {
  const validateField = (fieldName, value, context = {}) => {
    switch (fieldName) {
      case 'name':
        return churchValidator.validateName(value);
      case 'denomination':
        return churchValidator.validateDenomination(value);
      case 'pastor':
        return churchValidator.validatePastor(value);
      case 'address':
        return churchValidator.validateAddress(value);
      case 'city':
        return churchValidator.validateCity(value);
      case 'postalCode':
        return churchValidator.validatePostalCode(value);
      case 'coordinates':
        return churchValidator.validateCoordinates(value);
      case 'email':
        return churchValidator.validateEmail(value);
      case 'phone':
        return churchValidator.validatePhone(value);
      case 'website':
        return churchValidator.validateWebsite(value);
      case 'capacity':
        return churchValidator.validateCapacity(value);
      case 'yearBuilt':
        return churchValidator.validateYearBuilt(value);
      case 'parkingSpots':
        return churchValidator.validateParkingSpots(value);
      case 'services':
        return churchValidator.validateServices(value);
      case 'images':
        return churchValidator.validateImages(value);
      default:
        return null;
    }
  };
  
  const validateFormStep = (step, data) => {
    return churchValidator.validateStep(step, data);
  };
  
  const sanitizeData = (data) => {
    return churchValidator.sanitizeChurchData(data);
  };
  
  const isComplete = (data) => {
    return churchValidator.isChurchComplete(data);
  };
  
  return {
    validateField,
    validateFormStep,
    sanitizeData,
    isComplete,
    validationRules: churchValidationRules
  };
};

export default churchValidator;