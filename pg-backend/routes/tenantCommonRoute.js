const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const tenantAuth = require('../middleware/tenantAuth');

const router = express.Router();

// GET logged-in tenant rent records
router.get('/rent', tenantAuth, async (req, res, next) => {
  try {
    const tenantId = req.user.id;
    const pgId = req.user.pgId ;

    const [rows] = await pool.query(
      `SELECT 
      amount,
      due_date,
      status,
      date_paid
      FROM rent_records
      WHERE tenant_id = ?
      AND pg_id = ?
      ORDER BY due_date ASC`,
      [tenantId, pgId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});


// GET TENANT PROFILE DETAILS
router.get('/profile', tenantAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId ;
    const tenantId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        t.full_name,
        t.email,
        t.permanent_address AS address,
        r.room_number,
        r.room_type
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.id=? AND t.pg_id=?
    `, [tenantId, pgId]);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});



// TENANT PASSWORD CHANGE
router.post('/change-password', tenantAuth, async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const tenantId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const [rows] = await pool.query(
      'SELECT password_hash FROM tenants WHERE id = ? AND pg_id=?',
      [tenantId, pgId]
    );

    if (!rows.length || !rows[0].password_hash) {
      return res.status(400).json({ message: 'Password not found for tenant' });
    }

    const match = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }


    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE tenants SET password_hash = ? WHERE id = ? AND pg_id=?',
      [hashed, tenantId, pgId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;