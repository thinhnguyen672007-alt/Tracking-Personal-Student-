const express = require('express');
const cors = require('cors');
const path = require('path')
const app = express();
const PORT= process.env.PORT || 3000;
require('dotenv').config();

app.use(cors({
    origin : process.env.CLIENT_URL || "*",
    methods : ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ["Content-Type"],
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

// express.static giúp cho file upload trở thành file cho mọi người cùng
// xem và tự động tạo route app.get thay vi phải tạo hằng trăm file cho từng ảnh 
// dirname làm cho mặc định sẽ có C:/Projects/Gym/config.

app.use("/api/overview",  require("./routes/overview"));
app.use("/api/students",  require("./routes/students"));
app.use("/api/slots",     require("./routes/slots"));
app.use("/api/documents", require("./routes/documents"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Route không tồn tại
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Lỗi không mong muốn
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});