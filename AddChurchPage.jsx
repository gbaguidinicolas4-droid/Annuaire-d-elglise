import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChurch, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe,
  FaCar,
  FaWheelchair,
  FaCalendarAlt,
  FaClock,
  FaImage,
  FaPlus,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import { churchService } from '../services/churchService';
import { geocodeAddress } from '../services/googleMapsService';
import churchValidator from '../validators/churchValidators';
import "../styles/App.css";


const AddChurchPage = ({ addChurch }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    denomination: 'Catholique',
    pastor: '',
    pastorEmail: '',
    pastorPhone: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    capacity: '',
    yearBuilt: '',
    hasParking: false,
    parkingSpots: '',
    hasAccessibility: false,
    coordinates: {
      lat: null,
      lng: null
    }
  });
  
  const [services, setServices] = useState([
    { day: 'Dimanche', time: '10:00', type: 'Messe/Culte', language: 'Français' }
  ]);
  
  const [openingHours, setOpeningHours] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: ''
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Obtenir la localisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Géolocalisation non disponible');
        }
      );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { day: '', time: '', type: '', language: '' }]);
  };

  const removeService = (index) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleOpeningHoursChange = (day, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Vérifier le nombre d'images
    if (images.length + files.length > 10) {
      alert('Maximum 10 images autorisées');
      return;
    }
    
    // Vérifier la taille et le type des fichiers
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        alert(`${file.name} : Type de fichier non supporté. Utilisez JPG, PNG ou GIF.`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} : Fichier trop volumineux. Maximum 5MB.`);
        return false;
      }
      return true;
    });
    
    // Créer des aperçus
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          caption: '',
          isMain: prev.length === 0
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(newImages);
  };

  const handleGeocode = async () => {
    if (!formData.address || !formData.city || !formData.postalCode) {
      setGeocodingError('Veuillez remplir l\'adresse complète');
      return;
    }
    
    const fullAddress = `${formData.address}, ${formData.postalCode} ${formData.city}`;
    
    setGeocoding(true);
    setGeocodingError('');
    
    try {
      const result = await geocodeAddress(fullAddress);
      
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: result.lat,
          lng: result.lng
        }
      }));
      
      // Mettre à jour l'adresse formatée
      setFormData(prev => ({
        ...prev,
        address: result.formattedAddress.split(',')[0] || formData.address
      }));
      
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      setGeocodingError('Adresse introuvable. Vérifiez l\'adresse et réessayez.');
      
      // Utiliser la localisation de l'utilisateur comme secours
      if (userLocation) {
        setFormData(prev => ({
          ...prev,
          coordinates: userLocation
        }));
      }
    } finally {
      setGeocoding(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        coordinates: userLocation
      }));
      setGeocodingError('');
    } else {
      alert('Localisation non disponible. Veuillez autoriser la géolocalisation.');
    }
  };

  const validateStep = (stepNumber) => {
    const stepErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.name.trim()) stepErrors.name = 'Le nom de l\'église est requis';
        if (!formData.denomination) stepErrors.denomination = 'La dénomination est requise';
        if (!formData.pastor.trim()) stepErrors.pastor = 'Le nom du responsable est requis';
        if (!formData.address.trim()) stepErrors.address = 'L\'adresse est requise';
        if (!formData.city.trim()) stepErrors.city = 'La ville est requise';
        if (!formData.postalCode.trim()) stepErrors.postalCode = 'Le code postal est requis';
        break;
        
      case 2:
        // Validation des coordonnées
        if (!formData.coordinates.lat || !formData.coordinates.lng) {
          stepErrors.coordinates = 'Veuillez géolocaliser l\'adresse';
        }
        break;
        
      case 3:
        // Validation des services (au moins un)
        if (services.length === 0) {
          stepErrors.services = 'Ajoutez au moins un service ou culte';
        } else {
          services.forEach((service, index) => {
            if (!service.day.trim()) stepErrors[`service_day_${index}`] = 'Jour requis';
            if (!service.time.trim()) stepErrors[`service_time_${index}`] = 'Heure requise';
          });
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
    // Validation finale
    const finalErrors = churchValidator.validate(formData);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setStep(1); // Retourner à la première étape
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparer les données
      const churchData = {
        ...formData,
        services: services.filter(s => s.day && s.time),
        openingHours,
        socialMedia,
        images: images.map(img => ({
          url: img.preview, // Dans un cas réel, vous uploaderiez le fichier
          caption: img.caption,
          isMain: img.isMain
        }))
      };
      
      // Si on utilise la fonction addChurch locale (pour démo)
      if (addChurch) {
        addChurch(churchData);
        setSuccess(true);
        
        // Redirection après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        // Sinon, appel API
        const result = await churchService.addChurch(churchData);
        
        setSuccess(true);
        
        // Redirection vers la nouvelle église
        setTimeout(() => {
          navigate(`/eglise/${result.data.id}`);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ submit: 'Erreur lors de l\'ajout de l\'église. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-content">
          <FaCheck className="success-icon" />
          <h2>Église ajoutée avec succès !</h2>
          <p>Votre église a été soumise pour vérification.</p>
          <p>Vous serez redirigé vers l'accueil dans quelques secondes...</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-church-page">
      <div className="container">
        {/* En-tête */}
        <div className="page-header">
          <h1>
            <FaChurch /> Ajouter une église
          </h1>
          <p>Remplissez le formulaire pour ajouter votre église à l'annuaire</p>
        </div>

        {/* Étapes */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Informations de base</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Localisation</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Horaires</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Finalisation</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="church-form">
          {errors.submit && (
            <div className="error-alert">
              <FaExclamationTriangle />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Étape 1: Informations de base */}
          {step === 1 && (
            <div className="form-step">
              <h2>Informations de base</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    <FaChurch /> Nom de l'église *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Église Saint-Pierre"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="denomination">Dénomination *</label>
                  <select
                    id="denomination"
                    name="denomination"
                    value={formData.denomination}
                    onChange={handleInputChange}
                    className={errors.denomination ? 'error' : ''}
                  >
                    <option value="Catholique">Catholique</option>
                    <option value="Protestante">Protestante</option>
                    <option value="Orthodoxe">Orthodoxe</option>
                    <option value="Pentecôtiste">Pentecôtiste</option>
                    <option value="Évangélique">Évangélique</option>
                    <option value="Autre">Autre</option>
                  </select>
                  {errors.denomination && <span className="error-message">{errors.denomination}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pastor">
                    <FaUser /> Responsable / Pasteur *
                  </label>
                  <input
                    type="text"
                    id="pastor"
                    name="pastor"
                    value={formData.pastor}
                    onChange={handleInputChange}
                    placeholder="Ex: Père Martin"
                    className={errors.pastor ? 'error' : ''}
                  />
                  {errors.pastor && <span className="error-message">{errors.pastor}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pastorPhone">
                    <FaPhone /> Téléphone du responsable
                  </label>
                  <input
                    type="tel"
                    id="pastorPhone"
                    name="pastorPhone"
                    value={formData.pastorPhone}
                    onChange={handleInputChange}
                    placeholder="Ex: 01 23 45 67 89"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pastorEmail">
                    <FaEnvelope /> Email du responsable
                  </label>
                  <input
                    type="email"
                    id="pastorEmail"
                    name="pastorEmail"
                    value={formData.pastorEmail}
                    onChange={handleInputChange}
                    placeholder="Ex: pasteur@eglise.fr"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <FaMapMarkerAlt /> Adresse *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ex: 123 Rue de l'Église"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">Ville *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ex: Paris"
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">Code postal *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Ex: 75001"
                    className={errors.postalCode ? 'error' : ''}
                  />
                  {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="region">Région</label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Ex: Île-de-France"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {step === 2 && (
            <div className="form-step">
              <h2>Localisation</h2>
              
              <div className="geocoding-section">
                <h3>Géolocalisation</h3>
                <p>Cliquez sur "Géolocaliser" pour obtenir les coordonnées exactes de l'adresse.</p>
                
                <div className="geocoding-actions">
                  <button
                    type="button"
                    className="btn-geocode"
                    onClick={handleGeocode}
                    disabled={geocoding}
                  >
                    {geocoding ? (
                      <>
                        <FaSpinner className="spinner" />
                        Géolocalisation en cours...
                      </>
                    ) : (
                      <>
                        <FaMapMarkerAlt />
                        Géolocaliser l'adresse
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleUseCurrentLocation}
                  >
                    Utiliser ma position
                  </button>
                </div>
                
                {geocodingError && (
                  <div className="error-alert">
                    <FaExclamationTriangle />
                    <span>{geocodingError}</span>
                  </div>
                )}
                
                {formData.coordinates.lat && formData.coordinates.lng && (
                  <div className="coordinates-success">
                    <FaCheck className="success-icon" />
                    <span>
                      Coordonnées trouvées: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Téléphone de l'église
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ex: 01 23 45 67 89"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email de l'église
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ex: contact@eglise.fr"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">
                  <FaGlobe /> Site web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Ex: https://www.eglise.fr"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre église, son histoire, ses activités..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Précédent
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Horaires et services */}
          {step === 3 && (
            <div className="form-step">
              <h2>Horaires et services</h2>
              
              <div className="services-section">
                <h3>
                  <FaClock /> Horaires des cultes et services
                </h3>
                <p>Ajoutez les horaires réguliers des cultes et services.</p>
                
                {errors.services && (
                  <div className="error-alert">
                    <FaExclamationTriangle />
                    <span>{errors.services}</span>
                  </div>
                )}
                
                <div className="services-list">
                  {services.map((service, index) => (
                    <div key={index} className="service-form">
                      <div className="service-header">
                        <h4>Service {index + 1}</h4>
                        {services.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeService(index)}
                          >
                            <FaTimes /> Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="service-fields">
                        <div className="form-group">
                          <label>Jour *</label>
                          <select
                            value={service.day}
                            onChange={(e) => handleServiceChange(index, 'day', e.target.value)}
                            className={errors[`service_day_${index}`] ? 'error' : ''}
                          >
                            <option value="">Sélectionner un jour</option>
                            <option value="Dimanche">Dimanche</option>
                            <option value="Lundi">Lundi</option>
                            <option value="Mardi">Mardi</option>
                            <option value="Mercredi">Mercredi</option>
                            <option value="Jeudi">Jeudi</option>
                            <option value="Vendredi">Vendredi</option>
                            <option value="Samedi">Samedi</option>
                            <option value="Quotidien">Quotidien</option>
                            <option value="Mensuel">Mensuel</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Heure *</label>
                          <input
                            type="time"
                            value={service.time}
                            onChange={(e) => handleServiceChange(index, 'time', e.target.value)}
                            className={errors[`service_time_${index}`] ? 'error' : ''}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Type de service</label>
                          <input
                            type="text"
                            value={service.type}
                            onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                            placeholder="Ex: Messe, Culte, Prière, etc."
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Langue</label>
                          <input
                            type="text"
                            value={service.language}
                            onChange={(e) => handleServiceChange(index, 'language', e.target.value)}
                            placeholder="Ex: Français, Anglais, etc."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  className="btn-add-service"
                  onClick={addService}
                >
                  <FaPlus /> Ajouter un service
                </button>
              </div>

              <div className="opening-hours-section">
                <h3>Heures d'ouverture</h3>
                <p>Indiquez les heures d'ouverture de l'église.</p>
                
                <div className="opening-hours-grid">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="opening-hour-item">
                      <label>{getDayLabel(day)}</label>
                      <input
                        type="text"
                        value={hours}
                        onChange={(e) => handleOpeningHoursChange(day, e.target.value)}
                        placeholder="Ex: 9h-18h ou Fermé"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Précédent
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Finalisation */}
          {step === 4 && (
            <div className="form-step">
              <h2>Finalisation</h2>
              
              <div className="facilities-section">
                <h3>Équipements et informations complémentaires</h3>
                
                <div className="facilities-grid">
                  <div className="facility-item">
                    <label>
                      <input
                        type="checkbox"
                        name="hasParking"
                        checked={formData.hasParking}
                        onChange={handleInputChange}
                      />
                      <FaCar /> Parking disponible
                    </label>
                    
                    {formData.hasParking && (
                      <div className="facility-detail">
                        <label htmlFor="parkingSpots">Nombre de places</label>
                        <input
                          type="number"
                          id="parkingSpots"
                          name="parkingSpots"
                          value={formData.parkingSpots}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Ex: 50"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="facility-item">
                    <label>
                      <input
                        type="checkbox"
                        name="hasAccessibility"
                        checked={formData.hasAccessibility}
                        onChange={handleInputChange}
                      />
                      <FaWheelchair /> Accessible aux PMR
                    </label>
                  </div>
                  
                  <div className="facility-item">
                    <label htmlFor="capacity">Capacité (nombre de places)</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Ex: 200"
                    />
                  </div>
                  
                  <div className="facility-item">
                    <label htmlFor="yearBuilt">Année de construction</label>
                    <input
                      type="number"
                      id="yearBuilt"
                      name="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                      min="1000"
                      max={new Date().getFullYear()}
                      placeholder="Ex: 1850"
                    />
                  </div>
                </div>
              </div>

              <div className="images-section">
                <h3>
                  <FaImage /> Photos de l'église
                </h3>
                <p>Ajoutez des photos pour présenter votre église (max 10 images, 5MB par image)</p>
                
                <div className="image-upload">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imageUpload" className="btn-upload">
                    <FaImage /> Choisir des photos
                  </label>
                </div>
                
                {images.length > 0 && (
                  <div className="image-preview-grid">
                    {images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={image.preview} alt={`Preview ${index + 1}`} />
                        <div className="image-actions">
                          <input
                            type="text"
                            placeholder="Légende"
                            value={image.caption}
                            onChange={(e) => {
                              const newImages = [...images];
                              newImages[index].caption = e.target.value;
                              setImages(newImages);
                            }}
                          />
                          <div className="action-buttons">
                            {image.isMain ? (
                              <span className="main-badge">Principale</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-set-main"
                                onClick={() => setMainImage(index)}
                              >
                                Définir comme principale
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-remove-image"
                              onClick={() => removeImage(index)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="social-media-section">
                <h3>Réseaux sociaux</h3>
                
                <div className="social-inputs">
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/votre-eglise"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/votre-eglise"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>YouTube</label>
                    <input
                      type="url"
                      value={socialMedia.youtube}
                      onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/votre-eglise"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Twitter/X</label>
                    <input
                      type="url"
                      value={socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/votre-eglise"
                    />
                  </div>
                </div>
              </div>

              <div className="review-section">
                <h3>Récapitulatif</h3>
                <div className="review-content">
                  <h4>{formData.name}</h4>
                  <p>{formData.address}, {formData.postalCode} {formData.city}</p>
                  <p><strong>Responsable:</strong> {formData.pastor}</p>
                  <p><strong>Dénomination:</strong> {formData.denomination}</p>
                  <p><strong>Services:</strong> {services.filter(s => s.day && s.time).length} horaire(s) défini(s)</p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Précédent
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Enregistrement...
                    </>
                  ) : (
                    'Soumettre l\'église'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="form-info">
          <h3>
            <FaExclamationTriangle /> Important
          </h3>
          <ul>
            <li>Tous les champs marqués d'un * sont obligatoires</li>
            <li>Votre église sera vérifiée avant d'être publiée</li>
            <li>Vous pourrez modifier les informations plus tard</li>
            <li>Les photos doivent être libres de droits</li>
            <li>Les informations de contact ne seront publiées qu'avec votre accord</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour les labels des jours
const getDayLabel = (dayKey) => {
  const labels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };
  return labels[dayKey] || dayKey;
};

export default AddChurchPage;