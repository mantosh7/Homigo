const express = require('express');
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { roomSchema } = require('../schemas/roomSchemas')

const router = express.Router();

// Add a new room
router.post('/add', adminAuth, validate(roomSchema), async (req, res, next) => {
  try {
    const { room_number, room_type, capacity, floor, monthly_rent } = req.body;
    const pgId = req.user.pgId;

    const [r] = await pool.query(
      'INSERT INTO rooms (pg_id, room_number, room_type, capacity, floor, monthly_rent) VALUES (?, ?, ?, ?, ?, ?)',
      [pgId, room_number, room_type, capacity, floor, monthly_rent]
    );

    res.json({ id: r.insertId });

  } catch (err) {
    next(err);
  }
});

// Get all rooms with dynamically calculated occupancy data
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

// Update room details
router.put('/update/:id', adminAuth, validate(roomSchema), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const id = req.params.id;
    const { room_number, room_type, capacity, floor, monthly_rent } = req.body;

    // Prevent reducing capacity below the number of active tenants
    if (capacity !== undefined) {
      const [occupancy] = await pool.query(`
        SELECT COUNT(t.id) AS current_count
        FROM tenants t
        WHERE t.room_id = ? AND t.is_active = 1
      `, [id]);

      if (occupancy[0].current_count > capacity) {
        throw new AppError(
          `Cannot reduce capacity to ${capacity}. Room currently has ${occupancy[0].current_count} active tenants.`,
          400
        );
      }
    }

    const [result] = await pool.query(
      'UPDATE rooms SET room_number=?, room_type=?, capacity=?, floor=?, monthly_rent=? WHERE id=? AND pg_id=?',
      [room_number, room_type, capacity, floor, monthly_rent, id, pgId]
    );

    // Room does not exist
    if (result.affectedRows === 0) {
      throw new AppError('Room not found', 404);
    }

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

// Delete room
router.delete('/delete/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const roomId = req.params.id;

    // Check whether any tenants are still assigned to this room
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM tenants WHERE room_id = ? AND pg_id = ?',
      [roomId, pgId]
    );

    // Prevent deleting rooms that still have assigned tenants
    if (rows[0].cnt > 0) {
      throw new AppError(
        'Cannot delete room: tenants are assigned to this room. Move out or unassign tenants first.',
        400
      );
    }

    const [result] = await pool.query(
      'DELETE FROM rooms WHERE id=? AND pg_id=?',
      [roomId, pgId]
    );

    // Room does not exist
    if (result.affectedRows === 0) {
      throw new AppError('Room not found', 404);
    }

    res.json({ message: 'Room deleted successfully' });

  } catch (err) {
    next(err);
  }
});

// Get rooms that still have available seats
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