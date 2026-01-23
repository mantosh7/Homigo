const express = require("express");
const pool = require("../db"); // tumhara existing db connection

const router = express.Router();

router.get("/summary", async (req, res) =>{
  try {

    // Total Collected Amount
    const [pendingRows] = await pool.query(`
      SELECT 
      COALESCE(SUM(amount), 0) as totalPending
      FROM rent_records
      WHERE status = 'Pending'
      AND MONTH(due_date) = MONTH(CURRENT_DATE())
      AND YEAR(due_date) = YEAR(CURRENT_DATE())
      `
    )

    // Total Pending Amount
    const [paidRows] = await pool.query(`
      SELECT
      COALESCE(SUM(amount), 0) AS totalCollected
      FROM rent_records
      WHERE status = 'Paid'
      AND MONTH(date_paid) = MONTH(CURRENT_DATE())
      AND YEAR(date_paid) = YEAR(CURRENT_DATE())
    `);

    // Paid count
    const [paidCount] = await pool.query(`
      SELECT COUNT(*) AS paidCount
      FROM rent_records
      WHERE status = 'Paid'
        AND MONTH(date_paid) = MONTH(CURRENT_DATE())
        AND YEAR(date_paid) = YEAR(CURRENT_DATE())
    `);

    // Pending count
    const [pendingCount] = await pool.query(`
      SELECT COUNT(*) AS pendingCount
      FROM rent_records
      WHERE status = 'Pending'
        AND MONTH(due_date) = MONTH(CURRENT_DATE())
        AND YEAR(due_date) = YEAR(CURRENT_DATE())
    `);

    res.json({
      totalCollected: paidRows[0].totalCollected,
      totalPending: pendingRows[0].totalPending,
      paidCount: paidCount[0].paidCount,
      pendingCount: pendingCount[0].pendingCount
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
})

// monthly trend
router.get("/monthly-trend", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        MONTH(date_paid) AS month,
        SUM(amount) AS total
      FROM rent_records
      WHERE status = 'Paid'
        AND YEAR(date_paid) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(date_paid)
      ORDER BY MONTH(date_paid)
    `);

    res.json(rows);
  } catch (error) {
    console.error("Monthly trend error:", error);
    res.status(500).json({ message: "Failed to fetch monthly trend" });
  }
});


module.exports = router;
