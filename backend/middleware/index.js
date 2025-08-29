const corsMiddleware = require('./cors');
const errorHandler = require('./errorHandler');
const logger = require('./logger');

module.exports = {
  cors: corsMiddleware,
  errorHandler,
  logger,
};