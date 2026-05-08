const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/overview
router.get("/", async (req, res) => {
  try {
    const [[students], [sessions], [active], [free], weekly] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM students"),
      db.query("SELECT SUM(total_sessions) AS total FROM students"),
      db.query("SELECT COUNT(*) AS total FROM time_slots WHERE is_assigned = 1"),
      db.query("SELECT COUNT(*) AS total FROM time_slots WHERE is_assigned = 0"),
      db.query(`
        SELECT day_of_week, COUNT(*) AS count
        FROM time_slots WHERE is_assigned = 1
        GROUP BY day_of_week
        ORDER BY FIELD(day_of_week,
          'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
      `),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: students[0].total,
        totalSessions: sessions[0].total || 0,
        activeClasses:  active[0].total,
        freeSlots:      free[0].total,
        weeklyActivity: weekly[0],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;