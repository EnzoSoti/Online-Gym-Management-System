const { handleDatabaseOperation, sendSuccess, sendError, sendValidationError, sendUnauthorized } = require('../utils');

class AuthController {
  static async register(req, res) {
    try {
      const { full_name, username, password } = req.body;

      if (!full_name || !username || !password) {
        return sendValidationError(res, 'All fields are required');
      }

      // Check if username already exists
      const [existingUser] = await handleDatabaseOperation(async (connection) => {
        const [rows] = await connection.query(
          'SELECT username FROM user_sign_up WHERE username = ?',
          [username]
        );
        return rows;
      }, req.app.locals.pool);

      if (existingUser && existingUser.length > 0) {
        return sendValidationError(res, 'Username already exists');
      }

      // Insert new user
      await handleDatabaseOperation(async (connection) => {
        await connection.query(
          'INSERT INTO user_sign_up (full_name, username, password, created_at) VALUES (?, ?, ?, NOW())',
          [full_name, username, password]
        );
      }, req.app.locals.pool);

      sendSuccess(res, null, 'Registration successful', 201);
    } catch (error) {
      sendError(res, error, 'Registration failed');
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return sendValidationError(res, 'Username and password are required');
      }

      // Check user credentials
      const [user] = await handleDatabaseOperation(async (connection) => {
        const [rows] = await connection.query(
          'SELECT * FROM user_sign_up WHERE username = ? AND password = ?',
          [username, password]
        );
        return rows;
      }, req.app.locals.pool);

      if (!user) {
        return sendUnauthorized(res, 'Invalid username or password');
      }

      const userData = {
        id: user.user_id,
        username: user.username,
        full_name: user.full_name,
      };

      sendSuccess(res, { user: userData }, 'Login successful');
    } catch (error) {
      sendError(res, error, 'Login failed');
    }
  }

  static async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return sendValidationError(res, 'Username and password are required');
      }

      // Check admin credentials
      const [admin] = await handleDatabaseOperation(async (connection) => {
        const [rows] = await connection.query(
          'SELECT * FROM admin_sign_up WHERE username = ? AND password = ?',
          [username, password]
        );
        return rows;
      }, req.app.locals.pool);

      if (!admin) {
        return sendUnauthorized(res, 'Invalid username or password');
      }

      const adminData = {
        id: admin.user_id,
        username: admin.username,
        full_name: admin.full_name,
        role_name: admin.role_name,
      };

      sendSuccess(res, { admin: adminData }, 'Admin login successful');
    } catch (error) {
      sendError(res, error, 'Admin login failed');
    }
  }

  static async adminLogout(req, res) {
    try {
      if (req.session) {
        req.session.destroy();
      }
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      sendError(res, error, 'Logout failed');
    }
  }
}

module.exports = AuthController;