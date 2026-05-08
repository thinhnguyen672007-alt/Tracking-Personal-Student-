const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const db = require("../config/db");

// GET /api/students
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students/:id
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/students
router.post("/", async (req, res) => {
  try {
    const { name, class: cls } = req.body;

    // Validate bắt buộc
    if (!name || !cls) {
      return res.status(400).json({ success: false, error: "name và class là bắt buộc" });
    }

    // Kiểm tra free slots còn đủ không
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM time_slots WHERE is_assigned = 0"
    );
    if (count < 3) {
      return res.status(200).json({
        success: false,
        warning: true,
        freeSlots: count,
        message: `Chỉ còn ${count} slot trống. Cần ít nhất 3 slot trước khi thêm học sinh mới.`,
      });
    }

    const id = await Student.create(req.body);
    const newStudent = await Student.findById(id);
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/students/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, class: cls } = req.body;
    if (!name || !cls) {
      return res.status(400).json({ success: false, error: "name và class là bắt buộc" });
    }
    const affected = await Student.update(req.params.id, req.body);
    if (!affected) return res.status(404).json({ success: false, error: "Student not found" });
    const updated = await Student.findById(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    const affected = await Student.delete(req.params.id);
    if (!affected) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, message: "Đã xóa học sinh" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;