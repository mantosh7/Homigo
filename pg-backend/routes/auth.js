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
router.use(cookieParser());

// ADMIN SIGNUP
router.post("/admin/signup", async (req, res, next) => {
  try {
    const { pgName, pgAddress, name, email, password, otpVerified } = req.body;

    if (!otpVerified) {
      return res.status(403).json({
        message: "Please verify email using OTP before signup"
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Admin already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction start
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // create PG/Hostel
      const [pgResult] = await conn.query(
        "INSERT INTO pgs (name, address) VALUES (?, ?)",
        [pgName, pgAddress || null]
      );
      const pgId = pgResult.insertId;

      // create admin with pg/hostel id
      const [result] = await conn.query(
        "INSERT INTO admins (pg_id, name, email, password_hash) VALUES (?, ?, ?, ?)",
        [pgId, name || null, email, hashedPassword]
      );

      // save changes into real DB
      await conn.commit();
      conn.release();

      return res.status(201).json({
        message: "Signup successful",
        user: { id: result.insertId, pgId, name, email },
      });

    } catch (txError) {
      // rollback if any error occurs
      await conn.rollback();
      conn.release();
      throw txError; // error catches by outer catch() { next(error) }
    }

  } catch (error) {
    next(error);
  }
});


// ADMIN LOGIN
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT id, pg_id, name, email, password_hash FROM admins WHERE email = ?', [email]);

    const admin = rows[0];
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: admin.id, pgId: admin.pg_id, role: 'admin', email: admin.email, name: admin.name };
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

// ADMIN LOGOUT
router.post('/admin/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax'
  });
  return res.json({ ok: true, message: 'Logged out' });
});

// ME - read user from cookie
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