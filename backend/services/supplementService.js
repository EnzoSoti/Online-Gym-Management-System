const { handleDatabaseOperation } = require('../utils');

class SupplementService {
  static async getAllSupplements(pool) {
    return await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM supplements ORDER BY supplement_name'
      );
      return rows;
    }, pool);
  }

  static async getSupplementById(id, pool) {
    return await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM supplements WHERE id = ?',
        [id]
      );
      return rows[0];
    }, pool);
  }

  static async createSupplement(supplementData, pool) {
    const { supplement_name, quantity, price } = supplementData;
    
    return await handleDatabaseOperation(async (connection) => {
      const [result] = await connection.query(
        'INSERT INTO supplements (supplement_name, quantity, price) VALUES (?, ?, ?)',
        [supplement_name, quantity, price]
      );
      return result;
    }, pool);
  }

  static async updateSupplement(id, supplementData, pool) {
    const { supplement_name, quantity, price } = supplementData;
    
    return await handleDatabaseOperation(async (connection) => {
      const [result] = await connection.query(
        'UPDATE supplements SET supplement_name = ?, quantity = ?, price = ? WHERE id = ?',
        [supplement_name, quantity, price, id]
      );
      return result;
    }, pool);
  }

  static async deleteSupplement(id, pool) {
    return await handleDatabaseOperation(async (connection) => {
      const [result] = await connection.query(
        'DELETE FROM supplements WHERE id = ?',
        [id]
      );
      return result;
    }, pool);
  }

  static async purchaseSupplement(supplementId, quantity, pool) {
    return await handleDatabaseOperation(async (connection) => {
      // Start transaction
      await connection.beginTransaction();

      try {
        // Check current stock
        const [stockRows] = await connection.query(
          'SELECT quantity FROM supplements WHERE id = ?',
          [supplementId]
        );

        if (stockRows.length === 0) {
          throw new Error('Supplement not found');
        }

        const currentStock = stockRows[0].quantity;
        if (currentStock < quantity) {
          throw new Error('Insufficient stock');
        }

        // Update stock
        const [updateResult] = await connection.query(
          'UPDATE supplements SET quantity = quantity - ? WHERE id = ?',
          [quantity, supplementId]
        );

        // Commit transaction
        await connection.commit();
        return updateResult;
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
      }
    }, pool);
  }
}

module.exports = SupplementService;