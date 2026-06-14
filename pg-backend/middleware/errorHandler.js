const AppError = require('./AppError');

function errorHandler(err, req, res, next) {

  // logging the complete error on the server for debugging
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`,
    err
  );

  // Custom AppError (expected/operational errors)
  // Examples: "Room not found", "Invalid credentials", "Duplicate email"
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message // Safe to send to the client
    });
  }

  // MySQL duplicate entry error (ER_DUP_ENTRY)
  // Triggered when a UNIQUE constraint is violated
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 'error',
      message: 'This record already exists.'
    });
  }

  // JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please login again.'
    });
  }

  // JWT expiration error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Session expired. Please login again.'
    });
  }

  // Unexpected programming error (bug in the code)
  const isDev = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again.',

    // Showing additional details only in development mode
    ...(isDev && {
      detail: err.message,
      stack: err.stack
    })
  });
}

module.exports = errorHandler;