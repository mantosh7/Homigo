const express = require('express');
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');
const AppError = require('../middleware/AppError');
const validate = require('../middleware/validate')
const { createRentSchema } = require('../schemas/rentSchemas')

const router = express.Router();

router.get('/pending', adminAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const [rows] = await pool.query(
      `SELECT * FROM rent_records 
       WHERE status != 'Paid'
       AND pg_id=?
       ORDER BY id DESC`,
      [pgId]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});


router.post('/create', adminAuth, validate(createRentSchema), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const { tenant_id, amount, due_date } = req.body;

    const [r] = await pool.query(
      `INSERT INTO rent_records 
       (pg_id, tenant_id, amount, status, due_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [pgId, tenant_id, amount, 'Pending', due_date]
    );

    return res.json({ id: r.insertId });
  } catch (err) {
    next(err);
  }
});


//  Mark a rent record as paid 
router.put('/pay/:id', adminAuth, async (req, res, next) => {
  const id = req.params.id;
  const pgId = req.user.pgId;

  try {
    const [result] = await pool.query(
      `UPDATE rent_records
        SET status = 'Paid', date_paid = NOW()
        WHERE id = ? AND pg_id=?`,
      [id, pgId]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Rent record not found', 404);
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
