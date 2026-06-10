// routes/complaints.js
const express = require('express');
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// admin updates status
router.put('/update/:id', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId ;
    const id = req.params.id;
    const { status } = req.body;
    await pool.query('UPDATE complaints SET status = ? WHERE id = ? AND pg_id=?', [status, id, pgId]);
    res.json({ ok: true });
  } catch (err) { next(err) }
});

router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId ;
    const [rows] = await pool.query(
      `SELECT * 
        FROM complaints 
        WHERE status = ? AND pg_id=? 
        ORDER BY created_at DESC`,
      ['Pending', pgId]
    );
    res.json(rows);
  } catch (err) { next(err) }
});

module.exports = router;
