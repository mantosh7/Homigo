const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const pool = require('../db')
const { adminAuth } = require('../middleware/auth')
const generatePassword = require('../utils/password')
const transporter = require('../utils/email')
const AppError = require('../middleware/AppError')

const router = express.Router()

function generateInviteToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function sendInviteEmail(email, full_name, token) {
  const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
  const inviteLink = `${FRONTEND}/set-password?token=${token}`

  await transporter.sendMail({
    from: `"Homigo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Homigo — Set Your Password',
    text: `Hi ${full_name},\n\nYour account has been created on Homigo.\n\nSet your password here:\n${inviteLink}\n\nThis link expires in 24 hours.\n\nIf you did not expect this email, please ignore it.`
  })
}


// Add a new tenant (Admin)
router.post('/add', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const { full_name, phone, email, room_id, join_date, emergency_contact, permanent_address } = req.body

    // Check whether the selected room has available capacity
    if (room_id) {
      const [roomCheck] = await pool.query(`
        SELECT r.capacity, COUNT(t.id) AS current_count
        FROM rooms r
        LEFT JOIN tenants t ON t.room_id = r.id AND t.is_active = 1
        WHERE r.id = ? AND r.pg_id = ?
        GROUP BY r.id, r.capacity
      `, [room_id, pgId])

      // Room does not exist
      if (!roomCheck.length) {
        throw new AppError('Room not found', 404)
      }

      const { capacity, current_count } = roomCheck[0]

      // Prevent assigning tenants beyond room capacity
      if (current_count >= capacity) {
        throw new AppError('Room is full. Cannot assign more tenants.', 400)
      }
    }

    const inviteToken = generateInviteToken()
    const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)


    const [result] = await pool.query(
      `INSERT INTO tenants
      (pg_id, full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address, is_active, invite_token, invite_expires_at)
      VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, 1, ?, ?)`,
      [pgId, full_name, phone, email, room_id || null, join_date || null, emergency_contact || null, permanent_address || null,
        inviteToken, inviteExpiresAt]
    )

    // Sending invitation link to the tenant via email
    try {
      await sendInviteEmail(email, full_name, inviteToken)
    } catch (emailErr) {
      console.error(`[Invite Email Failed] tenant_id=${result.insertId}:`, emailErr.message)
      return res.status(201).json({
        message: 'Tenant added but invite email failed. Please resend the invite.',
        id: result.insertId,
        emailFailed: true
      })
    }

    return res.status(201).json({
      message: 'Tenant added successfully. Invite email sent.',
      id: result.insertId
    })

  } catch (err) {
    next(err)
  }
})


// Resend invite (Admin) 
router.post('/resend-invite/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId
    const tenantId = req.params.id

    // Tenant fetch karo
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash FROM tenants WHERE id = ? AND pg_id = ?',
      [tenantId, pgId]
    )

    if (!rows.length) throw new AppError('Tenant not found', 404)

    const tenant = rows[0]

    // No need to resend the invite link if the tenant has already set a password.
    if (tenant.password_hash && tenant.password_hash !== '') {
      throw new AppError('Tenant has already set their password.', 400)
    }

    // Generate a new token — the old one will be invalidated.
    const inviteToken = generateInviteToken()
    const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await pool.query(
      'UPDATE tenants SET invite_token = ?, invite_expires_at = ? WHERE id = ? AND pg_id = ?',
      [inviteToken, inviteExpiresAt, tenantId, pgId]
    )

    await sendInviteEmail(tenant.email, tenant.full_name, inviteToken)

    res.json({ message: 'Invite resent successfully.' })
  } catch (err) {
    next(err)
  }
})


// Set password via invite token (Public route — no auth needed)
router.post('/set-password', async (req, res, next) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      throw new AppError('Token and password are required.', 400)
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters.', 400)
    }

    // search tenant through token
    const [rows] = await pool.query(
      'SELECT id, invite_expires_at FROM tenants WHERE invite_token = ?',
      [token]
    )

    if (!rows.length) {
      throw new AppError('Invalid or expired invite link.', 400)
    }

    const tenant = rows[0]

    // Check whether the token has expired
    const now = new Date()
    if (now > new Date(tenant.invite_expires_at)) {
      throw new AppError('This invite link has expired. Please ask your admin to resend it.', 400)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // set password and clear token
    await pool.query(
      `UPDATE tenants
       SET password_hash = ?, invite_token = NULL, invite_expires_at = NULL
       WHERE id = ?`,
      [passwordHash, tenant.id]
    )

    res.json({ message: 'Password set successfully. You can now login.' })
  } catch (err) {
    next(err)
  }
})


// Get all active tenants for the current PG/Hostel
router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;

    const [rows] = await pool.query(`
      SELECT t.*, r.room_number,
        CASE WHEN t.invite_token IS NOT NULL AND t.password_hash = '' 
            THEN 1 ELSE 0 END AS invite_pending
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.is_active = 1 AND t.pg_id = ?
      ORDER BY t.id DESC
    `, [pgId])

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// Delete tenant
router.delete('/delete/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const tenantId = req.params.id

    // Verify that the tenant exists
    const [rows] = await pool.query(
      'SELECT room_id FROM tenants WHERE id = ? AND pg_id = ?',
      [tenantId, pgId]
    )

    if (!rows.length) {
      throw new AppError('Tenant not found', 404)
    }

    // Delete tenant record
    await pool.query(
      'DELETE FROM tenants WHERE id = ? AND pg_id = ?',
      [tenantId, pgId]
    )

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// Update tenant details
router.put('/update/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const tenantId = req.params.id
    const { full_name, phone, email, password, room_id, join_date, emergency_contact, permanent_address, is_active } = req.body

    // Verify that the tenant exists
    const [rows] = await pool.query(
      'SELECT room_id FROM tenants WHERE id = ? AND pg_id = ?',
      [tenantId, pgId]
    )

    if (!rows.length) {
      throw new AppError('Tenant not found', 404)
    }

    // Store current room assignment before updating
    const prevRoomId = rows[0].room_id

    // If room assignment is changing, validate the target room capacity
    if (room_id !== undefined && room_id !== prevRoomId && room_id) {
      const [roomCheck] = await pool.query(`
        SELECT r.capacity, COUNT(t.id) AS current_count
        FROM rooms r
        LEFT JOIN tenants t ON t.room_id = r.id AND t.is_active = 1
        WHERE r.id = ? AND r.pg_id = ?
        GROUP BY r.id, r.capacity
      `, [room_id, pgId])

      // Target room does not exist
      if (!roomCheck.length) {
        throw new AppError('Room not found', 404)
      }

      const { capacity, current_count } = roomCheck[0]

      // Prevent moving tenant into a full room
      if (current_count >= capacity) {
        throw new AppError('Room is full. Cannot assign more tenants.', 400)
      }
    }

    // Build update query dynamically based on provided fields
    const fields = []
    const values = []

    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name) }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
    if (email !== undefined) { fields.push('email = ?'); values.push(email) }
    if (join_date !== undefined) { fields.push('join_date = ?'); values.push(join_date || null) }
    if (emergency_contact !== undefined) { fields.push('emergency_contact = ?'); values.push(emergency_contact || null) }
    if (permanent_address !== undefined) { fields.push('permanent_address = ?'); values.push(permanent_address || null) }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0) }
    if (room_id !== undefined) { fields.push('room_id = ?'); values.push(room_id || null) }

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      fields.push('password_hash = ?')
      values.push(hash)
    }

    // Execute update only if at least one field is provided
    if (fields.length) {
      await pool.query(
        `UPDATE tenants SET ${fields.join(', ')} WHERE id = ? AND pg_id = ?`,
        [...values, tenantId, pgId]
      )
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router