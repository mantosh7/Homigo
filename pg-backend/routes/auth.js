const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const COOKIE_SECURE = (process.env.COOKIE_SECURE === 'true');

router.use(express.json());

// Keep cookieParser usage consistent (server.js already uses it; harmless here if called again)
router.use(cookieParser());

//---------------------  ADMIN SECTION ----------------------------------------

// ADMIN SIGNUP
router.post("/admin/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Admin already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
      [name || null, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Signup successful",
      user: { id: result.insertId, name, email },
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
});


// ADMIN LOGIN (unchanged)
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM admins WHERE email = ?', [email]);
    const admin = rows[0];
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: admin.id, role: 'admin', email: admin.email, name: admin.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 12 * 3600 * 1000
    });

    res.json({ user: payload });
  } catch (err) { next(err) }
});

// ADMIN LOGOUT (unchanged)
router.post('/admin/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax'
  });
  return res.json({ ok: true, message: 'Logged out' });
});

// TENANT LOGIN (unchanged)
router.post('/tenant/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT id, full_name, email, password_hash, is_active FROM tenants WHERE email = ?', [email]);
    const t = rows[0];
    if (!t || t.is_active === 0) return res.status(401).json({ message: 'Invalid credentials or inactive' });
    const ok = await bcrypt.compare(password, t.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: t.id, role: 'tenant', email: t.email, full_name: t.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 8 * 3600 * 1000
    });

    res.json({ user: payload });
  } catch (err) { next(err) }
});



// ME - read user from cookie (unchanged)
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(200).json({ user: null });
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: payload });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

module.exports = router;
