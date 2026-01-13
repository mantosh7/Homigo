const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// tenant complaint add
router.post("/add", requireAuth("tenant"), async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { room_id, title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & description required" });
    }

    await pool.query(
      `INSERT INTO complaints
       (tenant_id, room_id, title, description, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, room_id || null, title, description, priority || "Normal"]
    );

    res.json({ message: "Complaint submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// tenant - view own complaints
router.get("/", requireAuth("tenant"), async (req, res) => {
  try {
    const tenantId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, title, description, priority, status, created_at
       FROM complaints
       WHERE tenant_id = ?
       ORDER BY created_at DESC`,
      [tenantId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
