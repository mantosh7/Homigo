const rateLimit = require('express-rate-limit');

// Rule:
// - Maximum 5 failed login attempts per IP
// - Time window: 5 minutes
// - Successful logins are NOT counted

const loginLimiter = rateLimit({
  
  windowMs: 5 * 60 * 1000,
  max: 5,

  // Send modern RateLimit headers in the response
  standardHeaders: true,

  // Disable deprecated X-RateLimit-* headers
  legacyHeaders: false,

  // Custom response when the limit is exceeded
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again after 5 minutes.'
  },

  // Do not count successful login requests.
  // Only failed login attempts will increase the counter.
  skipSuccessfulRequests: true,
});


// General API Rate Limiter
// Prevents API abuse and excessive traffic.
// Rule:
// - Maximum 100 requests per IP
// - Time window: 1 minute

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please slow down.'
  }
});

module.exports = { loginLimiter, apiLimiter };