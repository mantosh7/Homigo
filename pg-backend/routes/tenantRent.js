const express = require('express');
const pool = require('../db');
const tenantAuth = require('../middleware/tenantAuth');

const router = express.Router();

// GET logged-in tenant rent records
router.get('/rent', tenantAuth, async (req, res, next) => {
  try {
    const tenantId = req.tenant.id;

    const [rows] = await pool.query(
      `SELECT 
      amount,
      due_date,
      status,
      date_paid
      FROM rent_records
      WHERE tenant_id = ?
      ORDER BY date_paid DESC`,
      [tenantId]
    );
    console.log(rows[0]) ;
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
