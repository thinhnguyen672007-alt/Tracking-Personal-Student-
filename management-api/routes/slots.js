const express = require("express");
const router = express.Router();
const Slot = require("../models/slot");

// GET /api/slots
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.findAll();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/slots/free
router.get("/free", async (req, res) => {
  try {
    const slots = await Slot.findFree();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/slots/active
router.get("/active", async (req, res) => {
  try {
    const slots = await Slot.findAssigned();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/slots
router.post("/", async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;
    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin slot" });
    }

    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    if (!days.includes(day_of_week)) {
      return res.status(400).json({ success: false, error: "day_of_week không hợp lệ" });
    }

    const id = await Slot.create({ day_of_week, start_time, end_time });
    res.status(201).json({ success: true, data: { id, day_of_week, start_time, end_time } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, error: "Slot này đã tồn tại" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/slots/:id/assign
router.post("/:id/assign", async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ success: false, error: "student_id là bắt buộc" });
    const affected = await Slot.assign(req.params.id, student_id);
    if (!affected) return res.status(409).json({ success: false, error: "Slot đã được dùng hoặc không tồn tại" });
    res.json({ success: true, message: "Đã assign học sinh vào slot" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/slots/:id/unassign
router.post("/:id/unassign", async (req, res) => {
  try {
    const affected = await Slot.unassign(req.params.id);
    if (!affected) return res.status(404).json({ success: false, error: "Slot không tồn tại" });
    res.json({ success: true, message: "Slot đã được giải phóng" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/slots/:id
router.delete("/:id", async (req, res) => {
  try {
    const affected = await Slot.delete(req.params.id);
    if (!affected) return res.status(404).json({ success: false, error: "Slot không tồn tại" });
    res.json({ success: true, message: "Đã xóa slot" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;