//ไฟล์เริ่มต้นรัน Server (Entry point)
require('dotenv').config();
const express = require('express');
const app = express();

// 1. นำเข้า Routes จากโฟลเดอร์ src/routes
const userRoutes = require('./src/routes/userRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

app.use(express.json());


app.use('/users', userRoutes);

// 2. เรียกใช้ Global Error Handler ตรงบรรทัดสุดท้าย (สำคัญมาก ต้องอยู่ล่างสุด)
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
