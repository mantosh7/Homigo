// Custom application error class.
// The built-in JavaScript Error object only stores an error message.
// By extending Error, we can also attach an HTTP status code
// and identify operational (expected) errors.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);           
    this.statusCode = statusCode;
    this.isOperational = true; 

    // properly captures Stack trace 
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;