const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/add', requireAuth('admin'), async (req, res, next) => {
  try {
    const { room_number, room_type, capacity, floor, monthly_rent } = req.body;
    const [r] = await pool.query(
      'INSERT INTO rooms (room_number, room_type, capacity, floor, monthly_rent) VALUES (?, ?, ?, ?, ?)',
      [room_number, room_type, capacity, floor, monthly_rent]
    );
    res.json({ id: r.insertId });
  } catch (err) { next(err); }
});

router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.put('/update/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { room_number, room_type, capacity, floor, monthly_rent, is_occupied } = req.body;
    await pool.query(
      'UPDATE rooms SET room_number=?, room_type=?, capacity=?, floor=?, monthly_rent=?, is_occupied=? WHERE id=?',
      [room_number, room_type, capacity, floor, monthly_rent, is_occupied ? 1 : 0, id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/delete/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
