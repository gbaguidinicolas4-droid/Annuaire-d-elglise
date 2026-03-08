import React, { useState } from 'react';
import { 
  FaFilter, 
  FaTimes, 
  FaCheck, 
  FaChurch, 
  FaCity,
  FaCar,
  FaWheelchair,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';

const FilterSidebar = ({ filters, onFilterChange, churches, stats }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Extraire les valeurs uniques pour les filtres
  const getUniqueValues = (field) => {
    if (!churches || churches.length === 0) return [];
    const values = churches.map(church => church[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const denominations = getUniqueValues('denomination');
  const cities = getUniqueValues('city');
  const regions = getUniqueValues('region');

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleToggle = (key) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  const clearFilters = () => {
    onFilterChange({
      denomination: '',
      city: '',
      region: '',
      hasParking: false,
      hasAccessibility: false,
      sortBy: 'distance',
      sortOrder: 'asc'
    });
  };

  return (
    <div className={`filter-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header">
        <h3>
          <FaFilter /> Filtres
        </h3>
        <button 
          className="btn-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <FaTimes /> : <FaFilter />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Dénomination */}
          <div className="filter-section">
            <h4>
              <FaChurch /> Dénomination
            </h4>
            <div className="filter-options">
              <button
                className={`filter-option ${!filters.denomination ? 'active' : ''}`}
                onClick={() => handleFilterChange('denomination', '')}
              >
                Toutes
              </button>
              {denominations.map((denomination) => (
                <button
                  key={denomination}
                  className={`filter-option ${filters.denomination === denomination ? 'active' : ''}`}
                  onClick={() => handleFilterChange('denomination', denomination)}
                >
                  {denomination}
                  {stats.byDenomination?.find(d => d.denomination === denomination) && (
                    <span className="count">
                      ({stats.byDenomination.find(d => d.denomination === denomination).count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ville */}
          <div className="filter-section">
            <h4>
              <FaCity /> Ville
            </h4>
            <div className="filter-search">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                list="cities-list"
              />
              <datalist id="cities-list">
                {cities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div className="popular-cities">
              {cities.slice(0, 5).map(city => (
                <button
                  key={city}
                  className={`filter-chip ${filters.city === city ? 'active' : ''}`}
                  onClick={() => handleFilterChange('city', city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Équipements */}
          <div className="filter-section">
            <h4>Équipements</h4>
            <div className="filter-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasParking}
                  onChange={() => handleToggle('hasParking')}
                />
                <FaCar /> Parking
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasAccessibility}
                  onChange={() => handleToggle('hasAccessibility')}
                />
                <FaWheelchair /> Accessibilité PMR
              </label>
            </div>
          </div>

          {/* Tri */}
          <div className="filter-section">
            <h4>Trier par</h4>
            <div className="sort-options">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="distance">Distance</option>
                <option value="name">Nom</option>
                <option value="city">Ville</option>
                <option value="capacity">Capacité</option>
              </select>
              
              <div className="sort-order">
                <button
                  className={`sort-btn ${filters.sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('sortOrder', 'asc')}
                  title="Croissant"
                >
                  <FaSortAmountUp />
                </button>
                <button
                  className={`sort-btn ${filters.sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('sortOrder', 'desc')}
                  title="Décroissant"
                >
                  <FaSortAmountDown />
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="filter-section stats-section">
              <h4>Statistiques</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{stats.total || 0}</div>
                  <div className="stat-label">Églises</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.byDenomination?.length || 0}</div>
                  <div className="stat-label">Dénominations</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.byCity?.length || 0}</div>
                  <div className="stat-label">Villes</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="filter-actions">
            <button 
              className="btn-apply"
              onClick={() => setIsExpanded(false)}
            >
              <FaCheck /> Appliquer
            </button>
            <button 
              className="btn-clear"
              onClick={clearFilters}
            >
              Réinitialiser
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterSidebar;