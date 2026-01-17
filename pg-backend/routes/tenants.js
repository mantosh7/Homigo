const express = require('express')
const pool = require('../db')
const { requireAuth } = require('../middleware/auth')
const bcrypt = require('bcrypt')
const generatePassword = require('../utils/password')
const transporter = require('../utils/email')

const router = express.Router()

// ADD TENANT (Admin)
router.post('/add', requireAuth('admin'), async (req, res, next) => {
  try {
    const { full_name, phone, email, room_id, join_date, emergency_contact, permanent_address } = req.body

    //  Generate password
    const plainPassword = generatePassword()
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    // Insert tenant
    const [result] = await pool.query(
      `INSERT INTO tenants
        (full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [full_name, phone, email, passwordHash, room_id || null, join_date || null, emergency_contact || null, permanent_address || null]
    )

    // Send password email
    await transporter.sendMail({
      from: `"Homigo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Homigo Login Credentials',
      text: `Your account has been created.\n\nPassword: ${plainPassword}`
    })

    // Mark room occupied (if assigned)
    if (room_id) {
      await pool.query(
        'UPDATE rooms SET is_occupied = 1 WHERE id = ?',
        [room_id]
      )
    }

    res.json({ id: result.insertId })

  } catch (err) {
    next(err)
  }
})

// GET ALL ACTIVE TENANTS
router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, r.room_number
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.is_active = 1
      ORDER BY t.id DESC
    `)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})


// DELETE TENANT (Move Out)
router.delete('/delete/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const tenantId = req.params.id

    //  Get tenant room
    const [rows] = await pool.query(
      'SELECT room_id FROM tenants WHERE id = ?',
      [tenantId]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Tenant not found' })
    }

    const roomId = rows[0].room_id

    // Delete tenant
    await pool.query('DELETE FROM tenants WHERE id = ?', [tenantId])

    // Free room
    if (roomId) {
      await pool.query(
        'UPDATE rooms SET is_occupied = 0 WHERE id = ?',
        [roomId]
      )
    }

    res.json({ ok: true })

  } catch (err) {
    next(err)
  }
})


// UPDATE TENANT
router.put('/update/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const tenantId = req.params.id
    const { full_name, phone, email, password, room_id, join_date, emergency_contact, permanent_address, is_active } = req.body

    // Get previous room
    const [rows] = await pool.query(
      'SELECT room_id FROM tenants WHERE id = ?',
      [tenantId]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Tenant not found' })
    }

    const prevRoomId = rows[0].room_id

    // Build update query
    const fields = []
    const values = []

    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name) }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
    if (email !== undefined) { fields.push('email = ?'); values.push(email) }
    if (join_date !== undefined) { fields.push('join_date = ?'); values.push(join_date || null) }
    if (emergency_contact !== undefined) { fields.push('emergency_contact = ?'); values.push(emergency_contact || null) }
    if (permanent_address !== undefined) { fields.push('permanent_address = ?'); values.push(permanent_address || null) }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0) }

    if (room_id !== undefined) {
      fields.push('room_id = ?')
      values.push(room_id || null)
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      fields.push('password_hash = ?')
      values.push(hash)
    }

    if (fields.length) {
      await pool.query(
        `UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`,
        [...values, tenantId]
      )
    }

    // Update room occupancy
    if (room_id !== undefined && prevRoomId !== room_id) {
      if (prevRoomId) {
        await pool.query(
          'UPDATE rooms SET is_occupied = 0 WHERE id = ?',
          [prevRoomId]
        )
      }
      if (room_id) {
        await pool.query(
          'UPDATE rooms SET is_occupied = 1 WHERE id = ?',
          [room_id]
        )
      }
    }

    res.json({ ok: true })

  } catch (err) {
    next(err)
  }
})

module.exports = router
