//ไฟล์เริ่มต้นรัน Server (Entry point)
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

// 1. นำเข้า Routes จากโฟลเดอร์ src/routes
const userRoutes = require('./src/routes/userRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true //เพื่อให้ตัวserverยอมรับการส่งCookieจากหน้าบ้าน
}));


app.use('/users', userRoutes);
app.use('/incidents', incidentRoutes);

// 2. เรียกใช้ Global Error Handler ตรงบรรทัดสุดท้าย (สำคัญมาก ต้องอยู่ล่างสุด)
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
