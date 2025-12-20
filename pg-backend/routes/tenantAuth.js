const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const COOKIE_SECURE = (process.env.COOKIE_SECURE === 'true');

// TENANT LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, is_active FROM tenants WHERE email = ?',
      [email]
    );

    const tenant = rows[0];

    if (!tenant || tenant.is_active === 0) {
      return res.status(401).json({ message: 'Invalid credentials or inactive tenant' });
    }

    const ok = await bcrypt.compare(password, tenant.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: tenant.id,
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

router.post('/tenant/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax'
  });
  res.json({ ok: true });
});


module.exports = router;
