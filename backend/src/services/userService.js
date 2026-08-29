const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getAllUsers = async () => {
    // Service จัดการ Business Logic และเรียก Repository หากต้องการติดต่อ Database
    const users = await userRepository.getAllUsers();

    // สามารถใส่ Logic อื่นๆ เพิ่มเติมตรงนี้ก่อนส่งกลับไปยัง Controller

    return users;
};

const getUserById = async (id) => {
    const user = await userRepository.getUserById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

const createUser = async (userData) => {
    const { email, password } = userData;

    // 1. เช็คอีเมลซ้ำ (สำคัญมาก)
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        // ถ้าเจออีเมลนี้ในระบบแล้ว ให้โยน Error 400 กลับไปเลย สร้างไม่ได้
        throw new AppError('Email is already in use', 400); 
    }

    // 2. แปลงรหัสผ่านให้เป็น String เสมอ ป้องกัน Error จาก bcrypt กรณีที่ส่งตัวเลขล้วนๆ มา
    const passwordString = String(password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordString, salt);

    const newUserData = {
        ...userData,
        password: hashedPassword
    };
    const newUser = await userRepository.createUser(newUserData);

    return newUser;
};



module.exports = {
    getAllUsers,
    getUserById,
    createUser
};
