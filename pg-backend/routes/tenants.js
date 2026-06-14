const express = require('express')
const bcrypt = require('bcrypt')
const pool = require('../db')
const { adminAuth } = require('../middleware/auth')
const generatePassword = require('../utils/password')
const transporter = require('../utils/email')
const AppError = require('../middleware/AppError')

const router = express.Router()

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

    const plainPassword = generatePassword()
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    const [result] = await pool.query(
      `INSERT INTO tenants
        (pg_id, full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [pgId, full_name, phone, email, passwordHash, room_id || null, join_date || null, emergency_contact || null, permanent_address || null]
    )

    // Sending login credentials to the tenant via email
    await transporter.sendMail({
      from: `"Homigo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Homigo Login Credentials',
      text: `Your account has been created.\n\nPassword: ${plainPassword}`
    })

    res.json({ id: result.insertId })

  } catch (err) {
    next(err)
  }
})

// Get all active tenants for the current PG/Hostel
router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;

    const [rows] = await pool.query(`
      SELECT t.*, r.room_number
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.is_active = 1
      AND t.pg_id = ?
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
    const {
      full_name,
      phone,
      email,
      password,
      room_id,
      join_date,
      emergency_contact,
      permanent_address,
      is_active
    } = req.body

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