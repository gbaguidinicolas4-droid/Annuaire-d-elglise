import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaFilter,
  FaTimes,
  FaCrosshairs,
  FaHistory,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaGlobe,
  FaPrayingHands
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import churchService from '../services/churchService';

const SearchBar = ({ 
  onSearch, 
  onLocationChange, 
  onFilterOpen,
  initialSearch = '',
  initialLocation = '',
  showFilters = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [denominations, setDenominations] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({
    denomination: searchParams.get('denomination') || '',
    city: searchParams.get('city') || '',
    hasParking: searchParams.get('parking') === 'true',
    hasAccessibility: searchParams.get('accessibility') === 'true'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const searchRef = useRef(null);
  const locationRef = useRef(null);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    loadRecentSearches();
    loadPopularSearches();
    
    // Récupérer la localisation actuelle
    getCurrentLocation();
  }, []);

  // Mettre à jour les suggestions quand la recherche change
  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const loadInitialData = async () => {
    try {
      // Charger les dénominations populaires
      const denominationsData = await churchService.getDenominations();
      setDenominations(denominationsData);
      
      // Charger les villes populaires
      const citiesData = await churchService.getPopularCities();
      setCities(citiesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const loadPopularSearches = async () => {
    try {
      const data = await churchService.getPopularSearches();
      setPopularSearches(data);
    } catch (error) {
      // Utiliser des données par défaut
      setPopularSearches([
        { term: 'Église Paris', count: 124 },
        { term: 'Culte dimanche', count: 89 },
        { term: 'Église catholique', count: 76 },
        { term: 'Messe', count: 65 }
      ]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Récupérer le nom de la ville à partir des coordonnées
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Géolocalisation refusée:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Dans une application réelle, utiliser un service de géocodage inverse
      // Pour l'exemple, on utilise une API fictive
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.address && data.address.city) {
        setLocation(data.address.city);
      }
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
    }
  };

  const debouncedFetchSuggestions = debounce(async (term) => {
    if (term.length < 2) return;
    
    setIsLoading(true);
    try {
      const suggestionsData = await churchService.searchSuggestions(term);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Erreur suggestions:', error);
      // Suggestions par défaut basées sur les données locales
      const defaultSuggestions = generateDefaultSuggestions(term);
      setSuggestions(defaultSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const generateDefaultSuggestions = (term) => {
    const citiesList = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'];
    const denominationsList = ['Catholique', 'Protestante', 'Orthodoxe', 'Pentecôtiste'];
    
    return [
      { type: 'church', name: `Églises contenant "${term}"` },
      ...citiesList
        .filter(city => city.toLowerCase().includes(term.toLowerCase()))
        .map(city => ({ type: 'city', name: `Ville: ${city}` })),
      ...denominationsList
        .filter(denom => denom.toLowerCase().includes(term.toLowerCase()))
        .map(denom => ({ type: 'denomination', name: `Dénomination: ${denom}` }))
    ].slice(0, 5);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const searchData = {
      term: searchTerm.trim(),
      location: location.trim(),
      ...filters
    };
    
    // Sauvegarder la recherche récente
    saveRecentSearch(searchData.term);
    
    // Notifier le parent
    if (onSearch) {
      onSearch(searchData);
    }
    
    // Navigation
    const params = new URLSearchParams();
    if (searchData.term) params.set('q', searchData.term);
    if (searchData.location) params.set('location', searchData.location);
    if (filters.denomination) params.set('denomination', filters.denomination);
    if (filters.city) params.set('city', filters.city);
    if (filters.hasParking) params.set('parking', 'true');
    if (filters.hasAccessibility) params.set('accessibility', 'true');
    
    navigate(`/?${params.toString()}`);
    
    setShowSuggestions(false);
  };

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    
    const updatedSearches = [
      term,
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleSuggestionClick = (suggestion) => {
    switch (suggestion.type) {
      case 'church':
        setSearchTerm(suggestion.name.replace('Églises contenant "', '').replace('"', ''));
        break;
      case 'city':
        setLocation(suggestion.name.replace('Ville: ', ''));
        break;
      case 'denomination':
        setFilters(prev => ({ ...prev, denomination: suggestion.name.replace('Dénomination: ', '') }));
        break;
      default:
        setSearchTerm(suggestion.name);
    }
    
    setShowSuggestions(false);
    
    // Déclencher la recherche
    const searchData = {
      term: suggestion.type === 'city' || suggestion.type === 'denomination' ? '' : suggestion.name,
      location: suggestion.type === 'city' ? suggestion.name.replace('Ville: ', '') : location,
      ...(suggestion.type === 'denomination' && { denomination: suggestion.name.replace('Dénomination: ', '') })
    };
    
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      if (onLocationChange) {
        onLocationChange('Ma position');
      }
      // Dans une application réelle, utiliser les coordonnées pour filtrer
      navigate(`/?lat=${currentLocation.lat}&lng=${currentLocation.lng}`);
    } else {
      getCurrentLocation();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLocation('');
    setFilters({
      denomination: '',
      city: '',
      hasParking: false,
      hasAccessibility: false
    });
    
    if (onSearch) {
      onSearch({ term: '', location: '' });
    }
    
    navigate('/');
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Si on a un callback pour les filtres
    if (onFilterOpen) {
      onFilterOpen(newFilters);
    }
  };

  const applyAdvancedFilters = () => {
    setShowAdvancedFilters(false);
    
    const searchData = {
      term: searchTerm.trim(),
      location: location.trim(),
      ...filters
    };
    
    if (onSearch) {
      onSearch(searchData);
    }
  };

  if (compact) {
    return (
      <div className="search-bar-compact">
        <form onSubmit={handleSearch} className="compact-search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Rechercher une église..."
              className="compact-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button type="submit" className="compact-search-btn">
            <FaSearch />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          {/* Champ de recherche principal */}
          <div className="input-group search-group">
            <FaSearch className="input-icon" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Nom d'église, pasteur, dénomination..."
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
            
            {/* Suggestions */}
            {showSuggestions && (searchTerm || recentSearches.length > 0) && (
              <div className="suggestions-dropdown">
                <div className="suggestions-header">
                  <h4>Suggestions</h4>
                  <button
                    type="button"
                    className="close-suggestions"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="loading-suggestions">
                    <div className="spinner-small"></div>
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <>
                    {searchTerm && suggestions.length > 0 && (
                      <div className="suggestions-section">
                        <div className="section-title">Suggestions pour "{searchTerm}"</div>
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <FaSearch className="suggestion-icon" />
                            <span>{suggestion.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {recentSearches.length > 0 && (
                      <div className="suggestions-section">
                        <div className="section-title">
                          <FaHistory /> Recherches récentes
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            type="button"
                            className="suggestion-item"
                            onClick={() => {
                              setSearchTerm(search);
                              setShowSuggestions(false);
                            }}
                          >
                            <FaHistory className="suggestion-icon" />
                            <span>{search}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {popularSearches.length > 0 && !searchTerm && (
                      <div className="suggestions-section">
                        <div className="section-title">
                          <FaStar /> Recherches populaires
                        </div>
                        {popularSearches.map((item, index) => (
                          <button
                            key={index}
                            type="button"
                            className="suggestion-item"
                            onClick={() => {
                              setSearchTerm(item.term);
                              setShowSuggestions(false);
                            }}
                          >
                            <FaStar className="suggestion-icon" />
                            <span>{item.term}</span>
                            <span className="search-count">({item.count})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Champ de localisation */}
          <div className="input-group location-group">
            <FaMapMarkerAlt className="input-icon" />
            <input
              ref={locationRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville, code postal, région..."
              className="location-input"
              list="cities-list"
            />
            <datalist id="cities-list">
              {cities.map((city, index) => (
                <option key={index} value={city.name} />
              ))}
            </datalist>
            
            <button
              type="button"
              className="location-btn"
              onClick={handleUseCurrentLocation}
              title="Utiliser ma position actuelle"
            >
              <FaCrosshairs />
            </button>
          </div>

          {/* Bouton de recherche */}
          <button type="submit" className="search-btn">
            <FaSearch /> Rechercher
          </button>

          {/* Bouton filtres avancés */}
          {showFilters && (
            <button
              type="button"
              className="filter-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FaFilter /> Filtres
              {Object.values(filters).some(Boolean) && (
                <span className="filter-badge"></span>
              )}
            </button>
          )}
        </div>

        {/* Filtres rapides */}
        <div className="quick-filters">
          <button
            type="button"
            className={`quick-filter ${filters.denomination === 'Catholique' ? 'active' : ''}`}
            onClick={() => handleFilterChange('denomination', 
              filters.denomination === 'Catholique' ? '' : 'Catholique'
            )}
          >
            <FaPrayingHands /> Catholique
          </button>
          
          <button
            type="button"
            className={`quick-filter ${filters.denomination === 'Protestante' ? 'active' : ''}`}
            onClick={() => handleFilterChange('denomination', 
              filters.denomination === 'Protestante' ? '' : 'Protestante'
            )}
          >
            <FaGlobe /> Protestante
          </button>
          
          <button
            type="button"
            className={`quick-filter ${filters.hasParking ? 'active' : ''}`}
            onClick={() => handleFilterChange('hasParking', !filters.hasParking)}
          >
            Parking
          </button>
          
          <button
            type="button"
            className={`quick-filter ${filters.hasAccessibility ? 'active' : ''}`}
            onClick={() => handleFilterChange('hasAccessibility', !filters.hasAccessibility)}
          >
            Accessible PMR
          </button>
          
          {(searchTerm || location || Object.values(filters).some(Boolean)) && (
            <button
              type="button"
              className="quick-filter clear-all"
              onClick={clearSearch}
            >
              <FaTimes /> Effacer tout
            </button>
          )}
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="advanced-filters-header">
              <h4>
                <FaFilter /> Filtres avancés
                {Object.values(filters).some(Boolean) && (
                  <span className="active-filters-count">
                    ({Object.values(filters).filter(Boolean).length} actifs)
                  </span>
                )}
              </h4>
              <button
                type="button"
                className="close-advanced"
                onClick={() => setShowAdvancedFilters(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="filters-grid">
              {/* Dénomination */}
              <div className="filter-group">
                <label>Dénomination</label>
                <select
                  value={filters.denomination}
                  onChange={(e) => handleFilterChange('denomination', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les dénominations</option>
                  {denominations.map((denomination) => (
                    <option key={denomination.id} value={denomination.name}>
                      {denomination.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div className="filter-group">
                <label>Ville spécifique</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Équipements */}
              <div className="filter-group">
                <label>Équipements</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasParking}
                      onChange={(e) => handleFilterChange('hasParking', e.target.checked)}
                    />
                    <span>Parking disponible</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasAccessibility}
                      onChange={(e) => handleFilterChange('hasAccessibility', e.target.checked)}
                    />
                    <span>Accessible aux PMR</span>
                  </label>
                </div>
              </div>

              {/* Capacité */}
              <div className="filter-group">
                <label>Capacité minimale</label>
                <select className="filter-select">
                  <option value="">Pas de préférence</option>
                  <option value="50">50+ places</option>
                  <option value="100">100+ places</option>
                  <option value="200">200+ places</option>
                  <option value="500">500+ places</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFilters({
                    denomination: '',
                    city: '',
                    hasParking: false,
                    hasAccessibility: false
                  });
                }}
              >
                Réinitialiser
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={applyAdvancedFilters}
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}

        {/* Recherches populaires */}
        {!searchTerm && !showAdvancedFilters && (
          <div className="popular-searches">
            <span className="popular-title">Recherches populaires:</span>
            {popularSearches.slice(0, 4).map((item, index) => (
              <button
                key={index}
                type="button"
                className="popular-search"
                onClick={() => {
                  setSearchTerm(item.term);
                  if (onSearch) {
                    onSearch({ term: item.term, location: '' });
                  }
                }}
              >
                {item.term}
                {item.count && <span className="count">({item.count})</span>}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

// Fonction debounce pour optimiser les appels API
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchBar;