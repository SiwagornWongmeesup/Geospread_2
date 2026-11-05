// ลืมรหัสผ่าน: ส่งรหัส 6 หลักทางอีเมล แล้วใช้รหัสนั้นตั้งรหัสผ่านใหม่
// กติกาเดียวกับรหัสยืนยันอีเมล: หมดอายุ 10 นาที, ขอใหม่ได้ทุก 60 วินาที, กรอกผิดได้ 5 ครั้ง
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const mailService = require('./mailService');
const AppError = require('../utils/AppError');

const CODE_EXPIRES_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// ใส่คำว่า reset นำหน้า เพื่อไม่ให้รหัสยืนยันอีเมลเอามาใช้รีเซ็ตรหัสผ่านได้
const hashCode = (userId, code) =>
    crypto.createHmac('sha256', process.env.JWT_SECRET).update(`reset:${userId}:${code}`).digest('hex');

const isSameHash = (first, second) => {
    const a = Buffer.from(first, 'hex');
    const b = Buffer.from(second, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// POST /users/forgot-password
// ตอบเหมือนกันเสมอไม่ว่าอีเมลจะมีในระบบหรือไม่ เพื่อไม่ให้ใช้หน้านี้เช็คว่าใครสมัครไว้บ้าง
const requestReset = async (email) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user) return { retryAfterSeconds: RESEND_COOLDOWN_SECONDS };

    // ยังไม่ครบเวลารอ: ไม่ส่งซ้ำ แต่บอกเวลาที่เหลือ
    const current = await userRepository.getPasswordReset(user.id);
    if (current) {
        const waited = Number(current.seconds_since_sent);
        if (waited < RESEND_COOLDOWN_SECONDS) {
            return { retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - waited) };
        }
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await userRepository.savePasswordReset(user.id, hashCode(user.id, code), CODE_EXPIRES_MINUTES);
    await mailService.sendPasswordResetCode(user.email, code, CODE_EXPIRES_MINUTES);
    return { retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
};

// POST /users/reset-password
const resetPassword = async (email, code, newPassword) => {
    const invalid = () => new AppError('รหัสไม่ถูกต้อง', 400, [], 'INVALID_CODE');

    const user = await userRepository.getUserByEmail(email);
    if (!user) throw invalid();

    const record = await userRepository.getPasswordReset(user.id);
    if (!record) throw invalid();

    if (record.attempts >= MAX_ATTEMPTS) {
        throw new AppError('กรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัสใหม่', 429, [], 'TOO_MANY_ATTEMPTS');
    }
    if (record.is_expired) {
        throw new AppError('รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่', 400, [], 'CODE_EXPIRED');
    }

    if (!isSameHash(record.code_hash, hashCode(user.id, code))) {
        const attempts = await userRepository.incrementPasswordResetAttempts(user.id);
        if (attempts >= MAX_ATTEMPTS) {
            throw new AppError('กรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัสใหม่', 429, [], 'TOO_MANY_ATTEMPTS');
        }
        throw new AppError('รหัสไม่ถูกต้อง', 400, [{ attemptsLeft: MAX_ATTEMPTS - attempts }], 'INVALID_CODE');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(newPassword), salt);
    await userRepository.updatePasswordAndVerify(user.id, hashedPassword);
    // ใช้รหัสได้ครั้งเดียว
    await userRepository.deletePasswordReset(user.id);
    return { reset: true };
};

module.exports = {
    requestReset,
    resetPassword,
};
