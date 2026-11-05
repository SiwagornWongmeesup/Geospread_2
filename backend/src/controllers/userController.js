const userService = require('../services/userService');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        // ให้ Error ไหลไปที่ errorHandler.js
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const newUser = await userService.createUser(userData)

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        next(error);
    }
}
const loginUser = async (req, res, next) => {
    try {
        const result = await userService.loginUser(req.body);

        res.status(200).json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// POST /users/verify-email — ยืนยันอีเมลด้วยรหัส 6 หลัก
const verifyEmail = async (req, res, next) => {
    try {
        const result = await userService.verifyEmail(req.body);
        res.status(200).json({ success: true, message: 'ยืนยันอีเมลสำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

// POST /users/resend-verification — ขอรหัสยืนยันใหม่
const resendVerification = async (req, res, next) => {
    try {
        const result = await userService.resendVerification(req.body);
        res.status(200).json({ success: true, message: 'ถ้าอีเมลนี้รอยืนยันอยู่ ระบบได้ส่งรหัสใหม่แล้ว', data: result });
    } catch (error) {
        next(error);
    }
};

// POST /users/forgot-password — ขอรหัสตั้งรหัสผ่านใหม่ทางอีเมล
const forgotPassword = async (req, res, next) => {
    try {
        const result = await userService.forgotPassword(req.body);
        res.status(200).json({ success: true, message: 'ถ้าอีเมลนี้มีบัญชีอยู่ ระบบได้ส่งรหัสไปแล้ว', data: result });
    } catch (error) {
        next(error);
    }
};

// POST /users/reset-password — ตั้งรหัสผ่านใหม่ด้วยรหัส 6 หลัก
const resetPassword = async (req, res, next) => {
    try {
        const result = await userService.resetPassword(req.body);
        res.status(200).json({ success: true, message: 'ตั้งรหัสผ่านใหม่สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword
};
