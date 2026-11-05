//ไฟล์เริ่มต้นรัน Server (Entry point)
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

// 1. นำเข้า Routes จากโฟลเดอร์ src/routes
const userRoutes = require('./src/routes/userRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const helpRequestRoutes = require('./src/routes/helpRequestRoutes');
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


// หน้าแรกไว้เช็คว่า server ทำงานอยู่ (เปิด URL ของ backend แล้วจะเห็นข้อความนี้)
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'geospread-backend' });
});

app.use('/users', userRoutes);
app.use('/incidents', incidentRoutes);
app.use('/help-requests', helpRequestRoutes)

// 2. เรียกใช้ Global Error Handler ตรงบรรทัดสุดท้าย (สำคัญมาก ต้องอยู่ล่างสุด)
app.use(errorHandler);

// บน Vercel ไม่ต้องเปิด port เอง: Vercel เรียกใช้ app ที่ export ออกไปให้
// ในเครื่องเรา (npm run dev) ยังเปิด port 5000 เหมือนเดิม
if (!process.env.VERCEL) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
