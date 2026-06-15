const express = require('express');
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { updateComplaintSchema } = require('../schemas/rentSchemas')

const router = express.Router();


//  Get all pending complaints 
router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const [rows] = await pool.query(
      `SELECT * FROM complaints 
        WHERE status = 'Pending' AND pg_id=? 
        ORDER BY created_at DESC`,
      [pgId]
    );

    res.json(rows);
  } catch (err) {
    next(err)
  }
});


// Update complaint status (Admin resolves or progresses it) 
router.put('/update/:id', adminAuth, validate(updateComplaintSchema), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const id = req.params.id;
    const { status } = req.body;

    const [result] = await pool.query(
      'UPDATE complaints SET status = ? WHERE id = ? AND pg_id=?',
      [status, id, pgId]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Complaint not found', 404);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err)
  }
});


module.exports = router;
