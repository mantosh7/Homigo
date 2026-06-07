const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/pending', requireAuth('admin'), async (req, res, next) => {
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


router.post('/create', requireAuth('admin'), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    let { tenant_id, amount, due_date } = req.body;

    if (tenant_id === undefined || tenant_id === null || amount === undefined || amount === null) {
      return res.status(400).json({ message: "Tenant and amount required" });
    }

    // normalize types
    const tenantNum = Number(tenant_id);
    tenant_id = Number.isNaN(tenantNum) ? tenant_id : tenantNum;

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum)) return res.status(400).json({ message: "Invalid amount" });
    amount = amountNum;

    if (!due_date) due_date = null;

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

router.put('/pay/:id', requireAuth('admin'), async (req, res, next) => {
  const id = req.params.id;
  const pgId = req.user.pgId;
  const today = new Date();

  try {
    await pool.query(
      `UPDATE rent_records 
       SET status = 'Paid', date_paid = ? 
       WHERE id = ? AND pg_id=?`,
      [today, id, pgId]
    );

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
