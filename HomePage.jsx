import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ChurchList from '../components/ChurchList';
import GoogleMapView from '../components/GoogleMapView';
import FilterSidebar from '../components/FilterSidebar';
import ChurchCard from '../components/ChurchCard';
import { churchService } from '../services/churchService';
import { loadGoogleMapsScript } from '../services/googleMapsService';
import { 
  FaMapMarkerAlt, 
  FaChurch, 
  FaFilter, 
  FaSyncAlt,
  FaExclamationTriangle 
} from 'react-icons/fa';

const HomePage = ({ churches: initialChurches, userLocation }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [churches, setChurches] = useState(initialChurches || []);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [filters, setFilters] = useState({
    denomination: searchParams.get('denomination') || '',
    city: searchParams.get('city') || '',
    hasParking: searchParams.get('parking') === 'true',
    hasAccessibility: searchParams.get('accessibility') === 'true',
    sortBy: searchParams.get('sortBy') || 'distance',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  });
  
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'list');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byDenomination: [],
    byCity: []
  });

  // Initialiser Google Maps
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setGoogleMapsLoaded(true);
    });
  }, []);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchChurches = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (locationFilter) params.city = locationFilter;
        if (filters.denomination) params.denomination = filters.denomination;
        if (filters.hasParking) params.hasParking = true;
        if (filters.hasAccessibility) params.hasAccessibility = true;
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }
        
        const data = await churchService.getAllChurches(params);
        setChurches(data.data || []);
        setFilteredChurches(data.data || []);
        setStats({
          total: data.count || 0,
          byDenomination: data.denominations || [],
          byCity: data.cities || []
        });
        
        // Mettre à jour les paramètres d'URL
        const newParams = new URLSearchParams();
        if (searchTerm) newParams.set('q', searchTerm);
        if (locationFilter) newParams.set('location', locationFilter);
        if (filters.denomination) newParams.set('denomination', filters.denomination);
        if (filters.hasParking) newParams.set('parking', 'true');
        if (filters.hasAccessibility) newParams.set('accessibility', 'true');
        if (viewMode) newParams.set('view', viewMode);
        setSearchParams(newParams);
        
      } catch (err) {
        console.error('Erreur lors du chargement des églises:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        // Utiliser les données initiales en cas d'erreur
        setFilteredChurches(initialChurches || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChurches();
  }, [searchTerm, locationFilter, filters, userLocation]);

  // Filtrer les églises
  const filterChurches = () => {
    let filtered = [...churches];
    
    // Filtre par recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(church => 
        church.name.toLowerCase().includes(term) ||
        church.city.toLowerCase().includes(term) ||
        church.pastor.toLowerCase().includes(term) ||
        church.denomination.toLowerCase().includes(term)
      );
    }
    
    // Filtre par ville
    if (filters.city) {
      filtered = filtered.filter(church => 
        church.city.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    // Filtre par dénomination
    if (filters.denomination) {
      filtered = filtered.filter(church => 
        church.denomination === filters.denomination
      );
    }
    
    // Filtre par parking
    if (filters.hasParking) {
      filtered = filtered.filter(church => church.hasParking);
    }
    
    // Filtre par accessibilité
    if (filters.hasAccessibility) {
      filtered = filtered.filter(church => church.hasAccessibility);
    }
    
    // Tri
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (filters.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'city':
          valueA = a.city.toLowerCase();
          valueB = b.city.toLowerCase();
          break;
        case 'distance':
          valueA = a.distance || 9999;
          valueB = b.distance || 9999;
          break;
        case 'capacity':
          valueA = a.capacity || 0;
          valueB = b.capacity || 0;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (filters.sortOrder === 'desc') {
        return valueA > valueB ? -1 : 1;
      }
      return valueA < valueB ? -1 : 1;
    });
    
    setFilteredChurches(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleLocationChange = (location) => {
    setLocationFilter(location);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setFilters({
      denomination: '',
      city: '',
      hasParking: false,
      hasAccessibility: false,
      sortBy: 'distance',
      sortOrder: 'asc'
    });
    setSearchParams({});
  };

  const handleGetDirections = (church) => {
    if (!userLocation) {
      alert('Veuillez autoriser la géolocalisation pour obtenir un itinéraire');
      return;
    }
    setSelectedChurch(church);
    setViewMode('map');
  };

  if (loading && churches.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des églises...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Bannière de recherche */}
      <div className="search-banner">
        <div className="container">
          <h1>Trouvez l'église la plus proche de chez vous</h1>
          <p>Recherchez parmi {stats.total} églises en France</p>
          
          <SearchBar 
            onSearch={handleSearch}
            onLocationChange={handleLocationChange}
            initialSearch={searchTerm}
            initialLocation={locationFilter}
          />
          
          <div className="quick-stats">
            <div className="stat-item">
              <FaChurch />
              <span>{stats.total} Églises</span>
            </div>
            <div className="stat-item">
              <FaMapMarkerAlt />
              <span>{stats.byCity.length} Villes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container main-content">
        <div className="content-header">
          <div className="results-info">
            <h2>
              {filteredChurches.length} église{filteredChurches.length !== 1 ? 's' : ''} trouvée{filteredChurches.length !== 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
              {locationFilter && ` à ${locationFilter}`}
            </h2>
               {/*<button 
              className="btn-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filtres
            </button>*/}
          </div>
          
          <div className="view-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                Liste
              </button>
              <button 
                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                disabled={!googleMapsLoaded}
              >
                Carte
              </button>
            </div>
            
            {(searchTerm || filters.denomination || filters.city || filters.hasParking || filters.hasAccessibility) && (
              <button 
                className="btn-clear-filters"
                onClick={handleClearFilters}
              >
                <FaSyncAlt /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <FaExclamationTriangle />
            <p>{error}</p>
          </div>
        )}

        <div className="content-wrapper">
          {/* Sidebar des filtres */}
          {(showFilters || window.innerWidth > 768) && (
            <div className="filter-sidebar-container">
              <FilterSidebar 
                filters={filters}
                onFilterChange={handleFilterChange}
                churches={churches}
                stats={stats}
              />
            </div>
          )}

          {/* Contenu principal */}
          <div className="main-content-area">
            {viewMode === 'list' ? (
              <>
                {filteredChurches.length === 0 ? (
                  <div className="no-results">
                    <FaChurch className="no-results-icon" />
                    <h3>Aucune église trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                    <button 
                      className="btn-primary"
                      onClick={handleClearFilters}
                    >
                      Voir toutes les églises
                    </button>
                  </div>
                ) : (
                  <div className="church-list-container">
                    <div className="church-list">
                      {filteredChurches.map((church) => (
                        <ChurchCard
                          key={church.id || church._id}
                          church={church}
                          userLocation={userLocation}
                          onGetDirections={handleGetDirections}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {filteredChurches.length > 20 && (
                      <div className="pagination">
                        <button className="page-btn disabled">Précédent</button>
                        <span className="page-info">Page 1 sur 5</span>
                        <button className="page-btn">Suivant</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="map-container-wrapper">
                {googleMapsLoaded ? (
                  <GoogleMapView
                    churches={filteredChurches}
                    selectedChurch={selectedChurch}
                    onSelectChurch={setSelectedChurch}
                    userLocation={userLocation}
                    filters={filters}
                  />
                ) : (
                  <div className="map-loading">
                    <div className="spinner"></div>
                    <p>Chargement de la carte...</p>
                  </div>
                )}
                
                {selectedChurch && viewMode === 'map' && (
                  <div className="selected-church-sidebar">
                    <ChurchCard
                      church={selectedChurch}
                      userLocation={userLocation}
                      onGetDirections={handleGetDirections}
                    />
                    <button 
                      className="btn-close-sidebar"
                      onClick={() => setSelectedChurch(null)}
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        {stats.byDenomination.length > 0 && (
          <div className="statistics-section">
            <h3>Répartition par dénomination</h3>
            <div className="denomination-stats">
              {stats.byDenomination.map((item, index) => (
                <div key={index} className="denomination-item">
                  <div className="denomination-label">
                    <div 
                      className="denomination-color"
                      style={{
                        backgroundColor: getDenominationColor(item.denomination)
                      }}
                    ></div>
                    <span>{item.denomination}</span>
                  </div>
                  <div className="denomination-count">
                    {item.count} église{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appel à l'action */}
      <div className="cta-section">
        <div className="container">
          <h2>Votre église n'est pas listée ?</h2>
          <p>Ajoutez-la gratuitement à notre annuaire</p>
          <button 
            className="btn-primary btn-large"
            onClick={() => navigate('/ajouter-eglise')}
          >
            Ajouter une église
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour les couleurs des dénominations
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

export default HomePage;