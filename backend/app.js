require("dotenv").config();
const express = require("express");
const { database, emailTransporter } = require('./config');
const routes = require('./routes');
const middleware = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
database.testConnection();

// Make database pool and email transporter available to routes
app.locals.pool = database.pool;
app.locals.transporter = emailTransporter;

// Middleware
app.use(express.json());
app.use(middleware.logger);
app.use(middleware.cors);

// Use routes
app.use('/', routes);

// Global error handler (should be last middleware)
app.use(middleware.errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});