const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { adminSignupSchema, adminLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/authSchemas')
const transporter = require('../utils/email')


require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const COOKIE_SECURE = (process.env.COOKIE_SECURE === 'true');

router.use(express.json());
router.use(cookieParser());


// Helper: Generate reset token 
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}


// Helper: Send password reset email 
async function sendResetEmail(email, name, token) {
  const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
  const resetLink = `${FRONTEND}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"Homigo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Homigo Password',
    text: `Hi ${name},\n\nYou requested to reset your password.\n\nClick here to set a new password:\n${resetLink}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`
  })
}


// ADMIN SIGNUP
router.post("/admin/signup", validate(adminSignupSchema), async (req, res, next) => {
  try {
    const { pgName, pgAddress, name, email, password, otpVerified } = req.body;

    if (!otpVerified) {
      throw new AppError('Please verify email using OTP before signup', 403);
    }

    const [existing] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing.length > 0) {
      throw new AppError('An account with this email already exists', 409);
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
      await conn.rollback();
      conn.release();
      throw txError; // error catches by outer catch() { next(error) }
    }

  } catch (error) {
    next(error);
  }
});


// ADMIN LOGIN
router.post('/admin/login', validate(adminLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT id, pg_id, name, email, password_hash FROM admins WHERE email = ?', [email]);

    const admin = rows[0];
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload = { id: admin.id, pgId: admin.pg_id, role: 'admin', email: admin.email, name: admin.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 12 * 3600 * 1000
    });

    res.json({ user: payload });
  } catch (err) {
    next(err)
  }
});


//  Request password reset (admin)
router.post('/admin/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body

    const [rows] = await pool.query(
      'SELECT id, name FROM admins WHERE email = ?',
      [email]
    )

    const admin = rows[0]

    // for security
    if (!admin) {
      return res.status(200).json({
        message: 'If this email exists, you will receive a password reset link'
      })
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = generateResetToken()
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Store token in DB
    await pool.query(
      'UPDATE admins SET reset_token = ?, reset_expires_at = ? WHERE id = ?',
      [resetToken, resetExpiresAt, admin.id]
    )

    // Send reset email
    try {
      await sendResetEmail(email, admin.name, resetToken)
    } catch (emailErr) {
      console.error(`[Reset Email Failed] admin_id=${admin.id}:`, emailErr.message)
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send reset email. Please try again.'
      })
    }

    res.json({
      message: 'If this email exists, you will receive a password reset link'
    })

  } catch (err) {
    next(err)
  }
})

//  reset password using token (admin)
router.post('/admin/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body

    // find admin by reset token
    const [rows] = await pool.query(
      'SELECT id, reset_expires_at FROM admins WHERE reset_token = ?',
      [token]
    )

    if (!rows.length) {
      throw new AppError('Invalid or expired reset link', 400)
    }

    const admin = rows[0]

    // check if token has expired (15 minute window)
    const now = new Date()
    if (now > new Date(admin.reset_expires_at)) {
      throw new AppError('This reset link has expired. Please request a new one.', 400)
    }

    // hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      `UPDATE admins 
       SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL
       WHERE id = ?`,
      [hashedPassword, admin.id]
    )

    res.json({ message: 'Password reset successfully. You can now login with your new password.' })

  } catch (err) {
    next(err)
  }
})


// ADMIN LOGOUT
router.post('/admin/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax'
  });
  return res.json({ ok: true, message: 'Logged out' });
});

// Get current user from cookie 
// Used by the frontend on page load to restore auth state
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(200).json({ user: null });

    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: payload });

  } catch (err) {
    res.json({ user: null })
  }
});

module.exports = router;