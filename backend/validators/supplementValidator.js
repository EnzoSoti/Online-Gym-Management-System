/**
 * Validation functions for supplement-related operations
 */

const validateSupplementData = (data) => {
  const errors = [];
  const { supplement_name, quantity, price } = data;

  if (!supplement_name || typeof supplement_name !== 'string' || supplement_name.trim().length === 0) {
    errors.push('Supplement name is required and must be a non-empty string');
  }

  if (quantity === undefined || quantity === null || isNaN(quantity) || quantity < 0) {
    errors.push('Quantity is required and must be a non-negative number');
  }

  if (price === undefined || price === null || isNaN(price) || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePurchaseData = (data) => {
  const errors = [];
  const { supplementId, quantity } = data;

  if (!supplementId || isNaN(supplementId) || supplementId <= 0) {
    errors.push('Valid supplement ID is required');
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateSupplementData,
  validatePurchaseData,
};