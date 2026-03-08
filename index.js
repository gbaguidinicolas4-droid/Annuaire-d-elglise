// Fichier d'export principal pour tous les validateurs
import churchValidator from './churchValidator';
import userValidator from './userValidator';
import reviewValidator from './reviewValidator';

export {
  churchValidator,
  userValidator,
  reviewValidator
};

// Fonction utilitaire pour valider un formulaire complet
export const validateForm = (formData, validatorType) => {
  switch (validatorType) {
    case 'church':
      return churchValidator.validateChurch(formData);
    case 'user':
      return userValidator.validateUser(formData);
    case 'review':
      return reviewValidator.validateReview(formData);
    default:
      throw new Error(`Type de validateur inconnu: ${validatorType}`);
  }
};

// Formater les erreurs pour l'affichage
export const formatValidationErrors = (errors) => {
  if (!errors) return [];
  
  const formatted = [];
  
  if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, error]) => {
      if (Array.isArray(error)) {
        error.forEach(err => {
          formatted.push({
            field,
            message: err,
            type: 'error'
          });
        });
      } else if (typeof error === 'string') {
        formatted.push({
          field,
          message: error,
          type: 'error'
        });
      }
    });
  } else if (typeof errors === 'string') {
    formatted.push({
      field: 'global',
      message: errors,
      type: 'error'
    });
  }
  
  return formatted;
};

// Fonction utilitaire pour afficher les erreurs dans un composant
export const displayErrors = (errors, fieldName) => {
  if (!errors || !errors[fieldName]) return null;
  
  const error = errors[fieldName];
  
  if (Array.isArray(error)) {
    return error.map((err, index) => (
      <div key={index} className="error-message">
        {err}
      </div>
    ));
  }
  
  if (typeof error === 'string') {
    return <div className="error-message">{error}</div>;
  }
  
  return null;
};

// Hook personnalisé pour la validation
export const useValidation = (validatorType) => {
  const getValidator = () => {
    switch (validatorType) {
      case 'church':
        return churchValidator;
      case 'user':
        return userValidator;
      case 'review':
        return reviewValidator;
      default:
        return null;
    }
  };
  
  const validator = getValidator();
  
  const validateField = (fieldName, value) => {
    if (!validator || !validator.validateOnChange) {
      return null;
    }
    
    return validator.validateOnChange(fieldName, value);
  };
  
  const validateFormStep = (stepNumber, data) => {
    if (!validator || !validator.validateStep) {
      return {};
    }
    
    return validator.validateStep(stepNumber, data);
  };
  
  const sanitizeData = (data) => {
    if (!validator || !validator.sanitizeChurchData) {
      return data;
    }
    
    return validator.sanitizeChurchData(data);
  };
  
  const getValidationRules = () => {
    if (!validator || !validator.getValidationRules) {
      return {};
    }
    
    return validator.getValidationRules();
  };
  
  return {
    validateField,
    validateFormStep,
    sanitizeData,
    getValidationRules,
    validator
  };
};