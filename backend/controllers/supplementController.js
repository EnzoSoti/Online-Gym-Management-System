const { sendSuccess, sendError, sendValidationError, sendNotFound } = require('../utils');
const { SupplementService } = require('../services');
const { supplementValidator } = require('../validators');

class SupplementController {
  static async getAllSupplements(req, res) {
    try {
      const supplements = await SupplementService.getAllSupplements(req.app.locals.pool);
      sendSuccess(res, supplements, 'Supplements fetched successfully');
    } catch (error) {
      sendError(res, error, 'Failed to fetch supplements');
    }
  }

  static async createSupplement(req, res) {
    try {
      const validation = supplementValidator.validateSupplementData(req.body);
      if (!validation.isValid) {
        return sendValidationError(res, validation.errors.join(', '));
      }

      const result = await SupplementService.createSupplement(req.body, req.app.locals.pool);
      sendSuccess(res, { supplementId: result.insertId }, 'Supplement added successfully', 201);
    } catch (error) {
      sendError(res, error, 'Failed to add supplement');
    }
  }

  static async updateSupplement(req, res) {
    try {
      const validation = supplementValidator.validateSupplementData(req.body);
      if (!validation.isValid) {
        return sendValidationError(res, validation.errors.join(', '));
      }

      const result = await SupplementService.updateSupplement(req.params.id, req.body, req.app.locals.pool);

      if (result.affectedRows === 0) {
        return sendNotFound(res, 'Supplement not found');
      }

      sendSuccess(res, null, 'Supplement updated successfully');
    } catch (error) {
      sendError(res, error, 'Failed to update supplement');
    }
  }

  static async deleteSupplement(req, res) {
    try {
      const result = await SupplementService.deleteSupplement(req.params.id, req.app.locals.pool);

      if (result.affectedRows === 0) {
        return sendNotFound(res, 'Supplement not found');
      }

      sendSuccess(res, null, 'Supplement deleted successfully');
    } catch (error) {
      sendError(res, error, 'Failed to delete supplement');
    }
  }

  static async buySupplement(req, res) {
    try {
      const validation = supplementValidator.validatePurchaseData(req.body);
      if (!validation.isValid) {
        return sendValidationError(res, validation.errors.join(', '));
      }

      const { supplementId, quantity } = req.body;
      await SupplementService.purchaseSupplement(supplementId, quantity, req.app.locals.pool);

      sendSuccess(res, null, 'Purchase successful');
    } catch (error) {
      const message = error.message === 'Insufficient stock' ? 'Insufficient stock' : 'Failed to process purchase';
      sendError(res, error, message);
    }
  }
}

module.exports = SupplementController;