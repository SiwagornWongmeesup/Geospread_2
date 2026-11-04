const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const emailVerificationService = require('./emailVerificationService');

const getAllUsers = async () => {
    // Service จัดการ Business Logic และเรียก Repository หากต้องการติดต่อ Database
    const users = await userRepository.getAllUsers();

    // สามารถใส่ Logic อื่นๆ เพิ่มเติมตรงนี้ก่อนส่งกลับไปยัง Controller

    return users;
};

const getUserById = async (id) => {
    const user = await userRepository.getUserById(id);
    if (!user) {
        throw new AppError('ไม่เจอผู้ใช้งาน', 404);
    }
    return user;
}

// ส่งรหัสยืนยัน ถ้าส่งอีเมลไม่สำเร็จไม่ให้การสมัครล้มทั้งหมด (บัญชีสร้างแล้ว ผู้ใช้กดส่งรหัสใหม่ได้)
const sendVerificationSafely = async (user, respectCooldown) => {
    try {
        const retryAfterSeconds = respectCooldown
            ? await emailVerificationService.sendCodeRespectingCooldown(user)
            : await emailVerificationService.sendCode(user);
        return { emailSent: true, retryAfterSeconds };
    } catch (error) {
        if (error.code !== 'EMAIL_SEND_FAILED') throw error;
        return { emailSent: false, retryAfterSeconds: 0 };
    }
};

const createUser = async (userData) => {
    const { email, password } = userData;

    // 1. แปลงรหัสผ่านให้เป็น String เสมอ ป้องกัน Error จาก bcrypt กรณีที่ส่งตัวเลขล้วนๆ มา
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    // 2. เช็คอีเมลซ้ำ (สำคัญมาก)
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser?.email_verified) {
        // อีเมลนี้มีบัญชีที่ยืนยันแล้ว สร้างซ้ำไม่ได้
        throw new AppError('อีเมลนี้ถูกใช้งานแล้ว', 400, [], 'EMAIL_TAKEN');
    }

    // 3. เคยสมัครไว้แต่ยังไม่ยืนยัน: อัปเดตข้อมูลเป็นค่าล่าสุดแล้วส่งรหัสใหม่ (ไม่ต้องสร้างบัญชีซ้ำ)
    if (existingUser) {
        const user = await userRepository.updateUnverifiedUser(existingUser.id, {
            password: hashedPassword,
            name: userData.name,
        });
        const delivery = await sendVerificationSafely(existingUser, true);
        return { user, requiresVerification: true, ...delivery };
    }

    // 4. บัญชีใหม่ ยังไม่ยืนยันอีเมล ส่งรหัส 6 หลักไปที่อีเมล
    const user = await userRepository.createUser({ ...userData, password: hashedPassword });
    const delivery = await sendVerificationSafely(user, false);
    return { user, requiresVerification: true, ...delivery };
};



const loginUser = async ({ email, password }) => {
    // 1. หา user จาก email
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
        throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    // 2. เปรียบเทียบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
        throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    // 3. ต้องยืนยันอีเมลก่อน (เช็คหลังรหัสผ่านถูก เพื่อไม่บอกสถานะบัญชีให้คนที่ไม่รู้รหัสผ่าน)
    if (!user.email_verified) {
        throw new AppError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ', 403, [], 'EMAIL_NOT_VERIFIED');
    }

    // 4. สร้าง JWT Token
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // 5. ส่งกลับ token + ข้อมูล user (ไม่ส่ง password)
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    };
};

const verifyEmail = ({ email, code }) => emailVerificationService.verify(email, code);

const resendVerification = ({ email }) => emailVerificationService.resend(email);

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    verifyEmail,
    resendVerification
};
