const express = require('express');
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/add', adminAuth, async (req, res, next) => {
  try {
    const { room_number, room_type, capacity, floor, monthly_rent } = req.body;
    const pgId = req.user.pgId;

    const [r] = await pool.query(
      'INSERT INTO rooms (pg_id, room_number, room_type, capacity, floor, monthly_rent) VALUES (?, ?, ?, ?, ?, ?)',
      [pgId, room_number, room_type, capacity, floor, monthly_rent]
    );
    res.json({ id: r.insertId });
  } catch (err) { next(err); }
});


router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;

    const [rows] = await pool.query(`
      SELECT 
        r.*,
        COUNT(t.id) AS occupied_seats,
        (r.capacity - COUNT(t.id)) AS available_seats
      FROM rooms r
      LEFT JOIN tenants t 
        ON r.id = t.room_id 
        AND t.is_active = 1
      WHERE r.pg_id = ?
      GROUP BY r.id
      ORDER BY r.id DESC
    `, [pgId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});


router.put('/update/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const id = req.params.id;
    const { room_number, room_type, capacity, floor, monthly_rent } = req.body;

    await pool.query(
      'UPDATE rooms SET room_number=?, room_type=?, capacity=?, floor=?, monthly_rent=? WHERE id=? AND pg_id=?',
      [room_number, room_type, capacity, floor, monthly_rent, id, pgId]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
});


router.delete('/delete/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const roomId = req.params.id;

    const [rows] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM tenants WHERE room_id = ? AND pg_id=?',
      [roomId, pgId]
    );

    if (rows[0].cnt > 0) {
      return res.status(400).json({
        message: 'Cannot delete room: tenants are assigned to this room. Move out or unassign tenants first.'
      });
    }

    await pool.query('DELETE FROM rooms WHERE id=? AND pg_id=?', [roomId, pgId]);

    return res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    next(err);
  }
});


// Get only rooms with available seats (for tenant allotment)
router.get('/available', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const [rows] = await pool.query(`
      SELECT 
        r.id,
        r.room_number,
        r.room_type,
        r.capacity,
        COUNT(t.id) AS occupied_seats,
        (r.capacity - COUNT(t.id)) AS available_seats
      FROM rooms r
      LEFT JOIN tenants t
        ON r.id = t.room_id
        AND t.is_active = 1
      WHERE r.pg_id = ?
      GROUP BY r.id
      HAVING available_seats > 0
      ORDER BY r.room_number
    `, [pgId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
