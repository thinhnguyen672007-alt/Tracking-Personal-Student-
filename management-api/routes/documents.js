const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/document");

// Cấu hình multer — lưu file vào folder uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Tên file = timestamp + tên gốc (tránh trùng)
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// GET /api/documents
router.get("/", async (req, res) => {
  try {
    const docs = await Document.findAll();
    // Group theo class_name
    const grouped = docs.reduce((acc, doc) => {
      if (!acc[doc.class_name]) acc[doc.class_name] = [];
      acc[doc.class_name].push(doc);
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "Chưa chọn file" });
    const { class_name } = req.body;
    if (!class_name) {
      fs.unlinkSync(req.file.path); // Xóa file nếu thiếu class_name
      return res.status(400).json({ success: false, error: "class_name là bắt buộc" });
    }
    const id = await Document.create({
      original_name: req.file.originalname,
      stored_name:   req.file.filename,
      file_size:     req.file.size,
      mime_type:     req.file.mimetype,
      class_name,
    });
    res.status(201).json({ success: true, data: { id, original_name: req.file.originalname, class_name } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    const storedName = await Document.delete(req.params.id);
    if (!storedName) return res.status(404).json({ success: false, error: "Document không tồn tại" });
    const filePath = path.join(__dirname, "../uploads", storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: "Đã xóa document" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;