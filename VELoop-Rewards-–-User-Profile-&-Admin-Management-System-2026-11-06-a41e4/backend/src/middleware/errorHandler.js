/**
 * Centralized Express error handling middleware.
 * Catches any errors thrown in routes/controllers and returns a secure, consistent JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
