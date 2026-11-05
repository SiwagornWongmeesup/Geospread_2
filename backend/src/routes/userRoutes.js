const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
    registerValidator,
    loginValidator,
    verifyEmailValidator,
    resendVerificationValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    getUserByIdValidator
} = require('../validators/userValidator');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

// ---------------------------------------------------------------------------
// Public Routes (ไม่ต้อง login)
// ---------------------------------------------------------------------------

// POST /users — สมัครสมาชิก
router.post('/', registerValidator, userController.createUser);

// POST /users/login — เข้าสู่ระบบ
router.post('/login', loginValidator, userController.loginUser);

// POST /users/verify-email — ยืนยันอีเมลด้วยรหัส 6 หลัก
router.post('/verify-email', verifyEmailValidator, userController.verifyEmail);

// POST /users/resend-verification — ขอรหัสยืนยันใหม่ (รอได้ทุก 60 วินาที)
router.post('/resend-verification', resendVerificationValidator, userController.resendVerification);

// POST /users/forgot-password — ขอรหัสตั้งรหัสผ่านใหม่ (ส่งทางอีเมล รอได้ทุก 60 วินาที)
router.post('/forgot-password', forgotPasswordValidator, userController.forgotPassword);

// POST /users/reset-password — ตั้งรหัสผ่านใหม่ด้วยรหัส 6 หลัก
router.post('/reset-password', resetPasswordValidator, userController.resetPassword);

// ---------------------------------------------------------------------------
// Protected Routes (ต้อง login)
// ---------------------------------------------------------------------------

// GET /users — ดูรายชื่อผู้ใช้ทั้งหมด (เฉพาะ admin)
router.get('/', authMiddleware, checkRole('admin'), userController.getAllUsers);

// GET /users/:id — ดูข้อมูลผู้ใช้ตาม ID (ต้อง login)
router.get('/:id', authMiddleware, getUserByIdValidator, userController.getUserById);

module.exports = router;
