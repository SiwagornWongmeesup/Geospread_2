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

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    loginUser
};
