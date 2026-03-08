import React, { useState } from 'react';
import ChurchCard from './ChurchCard';
import { 
  FaList, 
  FaThLarge, 
  FaSortAlphaDown, 
  FaSortAlphaUp,
  FaMapMarkerAlt,
  FaUsers,
  FaFilter
} from 'react-icons/fa';

const ChurchList = ({ churches, onSelectChurch, userLocation, onGetDirections }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [sortBy, setSortBy] = useState('distance');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredChurches, setFilteredChurches] = useState(churches);

  // Appliquer le tri
  const sortChurches = (churchesToSort) => {
    return [...churchesToSort].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
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
      
      if (sortOrder === 'desc') {
        return valueA > valueB ? -1 : 1;
      }
      return valueA < valueB ? -1 : 1;
    });
  };

  // Filtrer par dénomination
  const filterByDenomination = (denomination) => {
    if (!denomination) {
      setFilteredChurches(churches);
    } else {
      setFilteredChurches(churches.filter(church => church.denomination === denomination));
    }
  };

  // Filtrer par ville
  const filterByCity = (city) => {
    if (!city) {
      setFilteredChurches(churches);
    } else {
      setFilteredChurches(churches.filter(church => 
        church.city.toLowerCase().includes(city.toLowerCase())
      ));
    }
  };

  // Obtenir les statistiques
  const getStats = () => {
    const stats = {
      total: churches.length,
      byDenomination: {},
      byCity: {},
      withParking: churches.filter(c => c.hasParking).length,
      withAccessibility: churches.filter(c => c.hasAccessibility).length
    };

    churches.forEach(church => {
      stats.byDenomination[church.denomination] = 
        (stats.byDenomination[church.denomination] || 0) + 1;
      stats.byCity[church.city] = (stats.byCity[church.city] || 0) + 1;
    });

    return stats;
  };

  const stats = getStats();
  const sortedChurches = sortChurches(filteredChurches);

  return (
    <div className="church-list-container">
      {/* Barre de contrôle */}
      <div className="list-controls">
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vue grille"
          >
            <FaThLarge />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vue liste"
          >
            <FaList />
          </button>
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="distance">Distance</option>
            <option value="name">Nom</option>
            <option value="city">Ville</option>
            <option value="capacity">Capacité</option>
          </select>
          
          <button
            className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
            onClick={() => setSortOrder('asc')}
            title="Ordre croissant"
          >
            <FaSortAlphaDown />
          </button>
          <button
            className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
            onClick={() => setSortOrder('desc')}
            title="Ordre décroissant"
          >
            <FaSortAlphaUp />
          </button>
        </div>

        <div className="stats-summary">
          <span className="stat-item">
            <FaUsers /> {sortedChurches.length} églises
          </span>
          {userLocation && (
            <span className="stat-item">
              <FaMapMarkerAlt /> Tri par distance
            </span>
          )}
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="quick-filters">
        <div className="filter-group">
          <strong>Dénomination:</strong>
          <button 
            className="filter-chip"
            onClick={() => filterByDenomination('')}
          >
            Toutes
          </button>
          {Object.entries(stats.byDenomination).map(([denomination, count]) => (
            <button
              key={denomination}
              className="filter-chip"
              onClick={() => filterByDenomination(denomination)}
            >
              {denomination} ({count})
            </button>
          ))}
        </div>

        <div className="filter-group">
          <strong>Ville:</strong>
          <button 
            className="filter-chip"
            onClick={() => filterByCity('')}
          >
            Toutes
          </button>
          {Object.keys(stats.byCity)
            .sort()
            .slice(0, 8)
            .map(city => (
              <button
                key={city}
                className="filter-chip"
                onClick={() => filterByCity(city)}
              >
                {city} ({stats.byCity[city]})
              </button>
            ))}
        </div>
      </div>

      {/* Liste des églises */}
      {sortedChurches.length === 0 ? (
        <div className="no-results">
          <div className="no-results-content">
            <FaFilter className="no-results-icon" />
            <h3>Aucune église ne correspond aux filtres</h3>
            <p>Essayez de modifier vos critères de recherche</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setFilteredChurches(churches);
                setSortBy('distance');
                setSortOrder('asc');
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className={`churches-${viewMode}`}>
          {sortedChurches.map((church) => (
            <div 
              key={church.id || church._id} 
              className={`church-item ${viewMode}`}
            >
              <ChurchCard
                church={church}
                userLocation={userLocation}
                onGetDirections={onGetDirections}
                compact={viewMode === 'list'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {sortedChurches.length > 20 && (
        <div className="pagination">
          <div className="pagination-info">
            Affichage de 1 à 20 sur {sortedChurches.length} églises
          </div>
          <div className="pagination-controls">
            <button className="page-btn disabled">
              Précédent
            </button>
            <div className="page-numbers">
              <button className="page-number active">1</button>
              <button className="page-number">2</button>
              <button className="page-number">3</button>
              <span className="page-ellipsis">...</span>
              <button className="page-number">5</button>
            </div>
            <button className="page-btn">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Statistiques détaillées */}
      <div className="detailed-stats">
        <h4>Statistiques</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Églises totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(stats.byDenomination).length}</div>
            <div className="stat-label">Dénominations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(stats.byCity).length}</div>
            <div className="stat-label">Villes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.withParking}</div>
            <div className="stat-label">Avec parking</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.withAccessibility}</div>
            <div className="stat-label">Accessibles PMR</div>
          </div>
        </div>
        
        {/* Top villes */}
        <div className="top-cities">
          <h5>Top villes</h5>
          <div className="city-list">
            {Object.entries(stats.byCity)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([city, count]) => (
                <div key={city} className="city-item">
                  <span className="city-name">{city}</span>
                  <div className="city-bar">
                    <div 
                      className="city-bar-fill"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(stats.byCity))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="city-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchList;