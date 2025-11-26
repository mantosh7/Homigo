const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/add', requireAuth('admin'), async (req, res, next) => {
  const { full_name, phone, email, password, room_id, join_date, emergency_contact, permanent_address } = req.body;
  const pwdHash = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO tenants (full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, phone, email, pwdHash, room_id || null, join_date || null, emergency_contact, permanent_address]
    );
    if (room_id) {
      await conn.query('UPDATE rooms SET is_occupied = 1 WHERE id = ?', [room_id]);
    }
    await conn.commit();
    res.json({ id: r.insertId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tenants ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err) }
});

router.put('/moveout/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT room_id FROM tenants WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    const roomId = rows[0].room_id;
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('UPDATE tenants SET is_active = 0, room_id = NULL WHERE id = ?', [id]);
    if (roomId) await conn.query('UPDATE rooms SET is_occupied = 0 WHERE id = ?', [roomId]);
    await conn.commit();
    conn.release();
    res.json({ ok: true });
  } catch (err) { next(err) }
});

module.exports = router;
