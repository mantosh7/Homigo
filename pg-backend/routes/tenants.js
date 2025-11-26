const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Add Tenant
router.post('/add', requireAuth('admin'), async (req, res, next) => {
  const { full_name, phone, email, password, room_id, join_date, emergency_contact, permanent_address } = req.body;
  let conn;

  try {
    const pwdHash = await bcrypt.hash(password || 'changeme', 10);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO tenants
        (full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [full_name, phone, email, pwdHash, room_id || null, join_date || null, emergency_contact || null, permanent_address || null]
    );

    if (room_id) {
      await conn.query('UPDATE rooms SET is_occupied = 1 WHERE id = ?', [room_id]);
    }

    await conn.commit();
    return res.json({ id: r.insertId });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});


// Get All Active Tenants
router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tenants WHERE is_active = 1 ORDER BY id DESC');
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});


// PERMANENT DELETE (Move Out)
router.delete('/delete/:id', requireAuth('admin'), async (req, res, next) => {
  const id = req.params.id;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // First get room assigned
    const [rows] = await conn.query('SELECT room_id FROM tenants WHERE id = ?', [id]);
    if (!rows[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const roomId = rows[0].room_id;

    // Delete tenant permanently
    await conn.query('DELETE FROM tenants WHERE id = ?', [id]);

    // Free room if needed
    if (roomId) {
      await conn.query('UPDATE rooms SET is_occupied = 0 WHERE id = ?', [roomId]);
    }

    await conn.commit();
    return res.json({ ok: true });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
