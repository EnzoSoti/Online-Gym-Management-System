const { handleDatabaseOperation } = require('./database');
const responseHandler = require('./responseHandler');

module.exports = {
  handleDatabaseOperation,
  ...responseHandler,
};