const express = require("express");
const pool = require("../db");
const tenantAuth = require('../middleware/tenantAuth');

const router = express.Router();

// tenant complaint add
router.post("/add", tenantAuth, async (req, res) => {
  try {
    const pgId = req.user.pgId ;
    const tenantId = req.user.id;
    const { room_id, title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & description required" });
    }

    await pool.query(
      `INSERT INTO complaints
       (pg_id, tenant_id, room_id, title, description, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pgId, tenantId, room_id || null, title, description, priority || "Normal"]
    );

    res.json({ message: "Complaint submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// tenant - view own complaints
router.get("/", tenantAuth, async (req, res) => {
  try {
    const pgId = req.user.pgId ;
    const tenantId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, title, description, priority, status, created_at
       FROM complaints
       WHERE tenant_id = ?
       AND pg_id = ?
       ORDER BY created_at DESC`,
      [tenantId, pgId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
