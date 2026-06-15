const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { tenantLoginSchema } = require('../schemas/authSchemas')

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const COOKIE_SECURE = (process.env.COOKIE_SECURE === 'true');

// Tenant Login
router.post('/login', validate(tenantLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, pg_id, full_name, email, password_hash, is_active FROM tenants WHERE email = ?',
      [email]
    );

    const tenant = rows[0];

    if (!tenant || tenant.is_active === 0) {
      throw new AppError('Invalid credentials or inactive tenant', 401);
    }

    // Tenant may not have set a password yet (invite pending)
    if (!tenant.password_hash) {
      throw new AppError('Please set your password using the invite link sent to your email.', 401)
    }

    const passwordMatch  = await bcrypt.compare(password, tenant.password_hash);
    if (!passwordMatch ) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload = {
      id: tenant.id,
      pgId: tenant.pg_id,
      role: 'tenant',
      email: tenant.email,
      full_name: tenant.full_name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Tenant login successful',
      user: payload
    });

  } catch (err) {
    next(err);
  }
});


// Tenant Logout 
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax'
  });
  res.json({ ok: true });
});


module.exports = router;
