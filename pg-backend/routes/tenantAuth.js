const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { tenantLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/authSchemas')
const transporter = require('../utils/email')

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const isProduction = process.env.NODE_ENV === 'production'
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'


// ─── Helper: Generate reset token ────────────────────────────────
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Helper: Send password reset email ──────────────────────────
async function sendResetEmail(email, name, token) {
  const resetLink = `${FRONTEND}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"Homigo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Homigo Password',
    text: `Hi ${name},\n\nYou requested to reset your password.\n\nClick here to set a new password:\n${resetLink}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`
  })
}


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

    const passwordMatch = await bcrypt.compare(password, tenant.password_hash);
    if (!passwordMatch) {
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
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 12 * 3600 * 1000
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
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ ok: true });
});


//  Request password reset (tenant)
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body

    const [rows] = await pool.query(
      'SELECT id, full_name FROM tenants WHERE email = ? AND is_active = 1',
      [email]
    )

    const tenant = rows[0]

    if (!tenant) {
      return res.status(200).json({
        message: 'If this email exists, you will receive a password reset link'
      })
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = generateResetToken()
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Store token in DB
    await pool.query(
      'UPDATE tenants SET reset_token = ?, reset_expires_at = ? WHERE id = ?',
      [resetToken, resetExpiresAt, tenant.id]
    )

    // Send reset email
    try {
      await sendResetEmail(email, tenant.full_name, resetToken)
    } catch (emailErr) {
      console.error(`[Reset Email Failed] tenant_id=${tenant.id}:`, emailErr.message)
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

//  Reset password using token (tenant)
router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body

    // find tenant by reset token
    const [rows] = await pool.query(
      'SELECT id, reset_expires_at FROM tenants WHERE reset_token = ?',
      [token]
    )

    if (!rows.length) {
      throw new AppError('Invalid or expired reset link', 400)
    }

    const tenant = rows[0]

    // check if token has expired (15 minute window)
    const now = new Date()
    if (now > new Date(tenant.reset_expires_at)) {
      throw new AppError('This reset link has expired. Please request a new one.', 400)
    }

    // hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      `UPDATE tenants 
       SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL
       WHERE id = ?`,
      [hashedPassword, tenant.id]
    )

    res.json({ message: 'Password reset successfully. You can now login with your new password.' })

  } catch (err) {
    next(err)
  }
})

module.exports = router;
