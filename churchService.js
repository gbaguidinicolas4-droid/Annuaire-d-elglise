const API_URL = 'http://localhost:5000/api'; // Remplacez par votre URL backend

export const churchService = {
  // Récupérer toutes les églises
  getAllChurches: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}/churches?${queryParams}`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },

  // Récupérer une église par ID
  getChurchById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/churches/${id}`);
      if (!response.ok) throw new Error('Église non trouvée');
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },

  // Rechercher des églises
  searchChurches: async (searchTerm, location = null, radius = 10) => {
    try {
      const params = { search: searchTerm };
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
        params.radius = radius;
      }
      
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/churches/search?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },

  // Ajouter une église
  addChurch: async (churchData) => {
    try {
      const response = await fetch(`${API_URL}/churches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(churchData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },

  // Mettre à jour une église
  updateChurch: async (id, churchData) => {
    try {
      const response = await fetch(`${API_URL}/churches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(churchData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },

  // Supprimer une église
  deleteChurch: async (id) => {
    try {
      const response = await fetch(`${API_URL}/churches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }
}
export default churchService;