/**
 * Enhanced error handling for database operations
 * @param {Function} operation - Database operation function
 * @param {Object} pool - Database connection pool
 * @returns {Promise} - Result of the database operation
 */
const handleDatabaseOperation = async (operation, pool) => {
  const connection = await pool.getConnection();
  try {
    const result = await operation(connection);
    return result;
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  handleDatabaseOperation,
};