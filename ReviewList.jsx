import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaUser, 
  FaCalendarAlt, 
  FaThumbsUp, 
  FaThumbsDown,
  FaEdit,
  FaTrash,
  FaExclamationCircle
} from 'react-icons/fa';

const ReviewList = ({ churchId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [churchId, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Simuler l'appel API
      setTimeout(() => {
        const mockReviews = [
          {
            id: 1,
            user: { name: 'Marie D.', avatar: null },
            rating: 5,
            title: 'Communauté accueillante',
            comment: 'Très belle communauté, accueil chaleureux. Les cultes sont édifiants.',
            date: '2024-01-15',
            helpfulVotes: 12,
            unhelpfulVotes: 0,
            verified: true
          },
          {
            id: 2,
            user: { name: 'Jean P.', avatar: null },
            rating: 4,
            title: 'Bonne prédication',
            comment: 'Le pasteur est excellent, la musique est belle. Parking un peu limité.',
            date: '2024-01-10',
            helpfulVotes: 8,
            unhelpfulVotes: 1,
            verified: false
          }
        ];
        
        // Trier les avis
        const sortedReviews = [...mockReviews].sort((a, b) => {
          if (sortBy === 'rating') return b.rating - a.rating;
          if (sortBy === 'helpful') return b.helpfulVotes - a.helpfulVotes;
          return new Date(b.date) - new Date(a.date); // recent
        });
        
        setReviews(sortedReviews);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Erreur de chargement des avis');
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, type) => {
    // Logique de vote
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          [type === 'helpful' ? 'helpfulVotes' : 'unhelpfulVotes']: 
            review[type === 'helpful' ? 'helpfulVotes' : 'unhelpfulVotes'] + 1
        };
      }
      return review;
    }));
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Supprimer cet avis ?')) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="review-list">
      {/* En-tête avec statistiques */}
      <div className="review-header">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">{renderStars(Math.round(averageRating))}</div>
            <span className="rating-count">{reviews.length} avis</span>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={stars} className="distribution-row">
                  <span className="stars-label">{stars} étoiles</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="distribution-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <button 
          className="btn-add-review"
          onClick={() => setShowForm(!showForm)}
        >
          {userReview ? 'Modifier mon avis' : 'Ajouter un avis'}
        </button>
      </div>

      {/* Formulaire d'avis */}
      {showForm && (
        <div className="review-form-container">
          <h3>{userReview ? 'Modifier votre avis' : 'Donnez votre avis'}</h3>
          <ReviewForm 
            churchId={churchId}
            existingReview={userReview}
            onSuccess={() => {
              setShowForm(false);
              fetchReviews();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filtres de tri */}
      <div className="review-filters">
        <div className="sort-options">
          <span>Trier par:</span>
          <button 
            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => setSortBy('recent')}
          >
            Plus récents
          </button>
          <button 
            className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => setSortBy('rating')}
          >
            Meilleures notes
          </button>
          <button 
            className={`sort-btn ${sortBy === 'helpful' ? 'active' : ''}`}
            onClick={() => setSortBy('helpful')}
          >
            Plus utiles
          </button>
        </div>
      </div>

      {/* Liste des avis */}
      {loading ? (
        <div className="loading-reviews">
          <div className="spinner"></div>
          <p>Chargement des avis...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <FaExclamationCircle />
          <p>{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Soyez le premier à donner votre avis sur cette église !</p>
        </div>
      ) : (
        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{review.user.name}</div>
                    <div className="review-date">
                      <FaCalendarAlt /> {new Date(review.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                <div className="review-meta">
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                  {review.verified && (
                    <span className="verified-badge">Avis vérifié</span>
                  )}
                </div>
              </div>
              
              <div className="review-content">
                {review.title && <h4>{review.title}</h4>}
                <p>{review.comment}</p>
              </div>
              
              <div className="review-footer">
                <div className="vote-buttons">
                  <button 
                    className="vote-btn helpful"
                    onClick={() => handleVote(review.id, 'helpful')}
                  >
                    <FaThumbsUp /> Utile ({review.helpfulVotes})
                  </button>
                  <button 
                    className="vote-btn unhelpful"
                    onClick={() => handleVote(review.id, 'unhelpful')}
                  >
                    <FaThumbsDown /> ({review.unhelpfulVotes})
                  </button>
                </div>
                
                <div className="review-actions">
                  {review.user.id === 'current-user-id' && (
                    <>
                      <button className="action-btn edit">
                        <FaEdit /> Modifier
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(review.id)}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </>
                  )}
                  <button className="action-btn report">
                    Signaler
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviews.length > 10 && (
        <div className="reviews-pagination">
          <button className="page-btn disabled">Précédent</button>
          <span className="page-info">Page 1 sur 3</span>
          <button className="page-btn">Suivant</button>
        </div>
      )}
    </div>
  );
};

// Composant de formulaire d'avis
const ReviewForm = ({ churchId, existingReview, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    worshipExperience: existingReview?.worshipExperience || 0,
    community: existingReview?.community || 0,
    accessibility: existingReview?.accessibility || 0
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError('Veuillez donner une note');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Veuillez écrire un commentaire');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Avis soumis:', { churchId, ...formData });
      onSuccess();
      
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}
      
      {/* Notation globale */}
      <div className="form-section">
        <label>Note globale *</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (hoverRating || formData.rating) ? 'active' : ''}`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              title={`${star} étoile${star > 1 ? 's' : ''}`}
            >
              <FaStar />
            </button>
          ))}
          <span className="rating-label">
            {formData.rating === 0 ? 'Sélectionnez une note' : `${formData.rating}/5`}
          </span>
        </div>
      </div>
      
      {/* Détails de la note */}
      <div className="form-section">
        <label>Détails (optionnel)</label>
        <div className="detail-ratings">
          <div className="detail-rating">
            <span>Culte/Prédication</span>
            <div className="detail-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`detail-star ${star <= formData.worshipExperience ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, worshipExperience: star }))}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          
          <div className="detail-rating">
            <span>Communauté/Accueil</span>
            <div className="detail-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`detail-star ${star <= formData.community ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, community: star }))}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          
          <div className="detail-rating">
            <span>Accessibilité</span>
            <div className="detail-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`detail-star ${star <= formData.accessibility ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, accessibility: star }))}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Titre */}
      <div className="form-section">
        <label htmlFor="reviewTitle">Titre (optionnel)</label>
        <input
          type="text"
          id="reviewTitle"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: 'Communauté exceptionnelle'"
          maxLength="100"
        />
      </div>
      
      {/* Commentaire */}
      <div className="form-section">
        <label htmlFor="reviewComment">Commentaire *</label>
        <textarea
          id="reviewComment"
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          placeholder="Partagez votre expérience avec cette église..."
          rows="5"
          maxLength="1000"
          required
        />
        <div className="char-count">
          {formData.comment.length}/1000 caractères
        </div>
      </div>
      
      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn-submit"
          disabled={submitting}
        >
          {submitting ? 'Envoi en cours...' : existingReview ? 'Modifier' : 'Publier'}
        </button>
      </div>
      
      <div className="form-note">
        <p>
          <small>
            Votre avis sera publié après modération. Les avis contenant des propos 
            inappropriés seront supprimés.
          </small>
        </p>
      </div>
    </form>
  );
};

export default ReviewList;