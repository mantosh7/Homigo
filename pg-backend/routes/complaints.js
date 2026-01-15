// routes/complaints.js
const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// tenant creates complaint
router.post('/add', requireAuth('tenant'), async (req, res, next) => {
  try {
    const tenantId = req.user.id;
    const { room_id, category, priority, title, description } = req.body;
    const [r] = await pool.query(`INSERT INTO complaints (tenant_id, room_id, category, priority, title, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [tenantId, room_id || null, category, priority || 'Medium', title, description]);
    res.json({ id: r.insertId });
  } catch (err) { next(err) }
});

// admin updates status
router.put('/update/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    res.json({ ok: true });
  } catch (err) { next(err) }
});

router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC',['Pending']);
    res.json(rows);
  } catch (err) { next(err) }
});

module.exports = router;
