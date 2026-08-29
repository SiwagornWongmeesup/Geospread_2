// const { param } = require('express-validator');
// const validateRequest = require('../middlewares/validateRequest');

// const getUserByIdValidator = [
//     // ตรวจสอบว่า id ใน path parameter เป็นตัวเลข (หรือตาม schema ที่คุณใช้ เช่น UUID)
//     // ในที่นี้สมมติให้รับ id แบบตัวเลขก่อน
//     param('id')
//         .notEmpty().withMessage('User ID is required')
//         .isInt({ min: 1 }).withMessage('User ID must be a valid positive integer')
//         .toInt(), // แปลงจาก string เป็น integer
    
//     // ใช้ middleware กลางเพื่อดักผลลัพธ์
//     validateRequest
// ];

// module.exports = {
//     getUserByIdValidator
// };
