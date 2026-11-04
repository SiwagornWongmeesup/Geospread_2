// ยืนยันอีเมลด้วยรหัส 6 หลักที่ส่งทางอีเมล
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const mailService = require('./mailService');
const AppError = require('../utils/AppError');

const CODE_EXPIRES_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// เก็บรหัสแบบ HMAC ผูกกับ user id: ถ้าฐานข้อมูลรั่ว ก็เอาไปใช้ตรงๆ ไม่ได้
const hashCode = (userId, code) =>
    crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${userId}:${code}`).digest('hex');

const isSameHash = (first, second) => {
    const a = Buffer.from(first, 'hex');
    const b = Buffer.from(second, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// ส่งรหัสใหม่ให้ผู้ใช้ (เขียนทับรหัสเดิม) คืนจำนวนวินาทีที่ต้องรอก่อนขอรหัสใหม่ได้อีก
const sendCode = async (user) => {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await userRepository.saveEmailVerification(user.id, hashCode(user.id, code), CODE_EXPIRES_MINUTES);
    await mailService.sendVerificationCode(user.email, code, CODE_EXPIRES_MINUTES);
    return RESEND_COOLDOWN_SECONDS;
};

// ส่งรหัสใหม่ ถ้ายังไม่ครบเวลารอจะไม่ส่งซ้ำ แต่บอกเวลาที่เหลือ
const sendCodeRespectingCooldown = async (user) => {
    const current = await userRepository.getEmailVerification(user.id);
    if (current) {
        const waited = Number(current.seconds_since_sent);
        if (waited < RESEND_COOLDOWN_SECONDS) {
            return Math.ceil(RESEND_COOLDOWN_SECONDS - waited);
        }
    }
    return sendCode(user);
};

// POST /users/resend-verification
// ตอบเหมือนกันเสมอไม่ว่าอีเมลจะมีในระบบหรือไม่ เพื่อไม่ให้ใช้ endpoint นี้เช็คว่าใครสมัครไว้บ้าง
const resend = async (email) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user || user.email_verified) {
        return { retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
    }
    const retryAfterSeconds = await sendCodeRespectingCooldown(user);
    return { retryAfterSeconds };
};

// POST /users/verify-email
const verify = async (email, code) => {
    const invalid = () => new AppError('รหัสยืนยันไม่ถูกต้อง', 400, [], 'INVALID_CODE');

    const user = await userRepository.getUserByEmail(email);
    if (!user) throw invalid();
    if (user.email_verified) return { alreadyVerified: true };

    const record = await userRepository.getEmailVerification(user.id);
    if (!record) throw invalid();

    if (record.attempts >= MAX_ATTEMPTS) {
        throw new AppError('กรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัสใหม่', 429, [], 'TOO_MANY_ATTEMPTS');
    }
    if (record.is_expired) {
        throw new AppError('รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่', 400, [], 'CODE_EXPIRED');
    }

    if (!isSameHash(record.code_hash, hashCode(user.id, code))) {
        const attempts = await userRepository.incrementVerificationAttempts(user.id);
        if (attempts >= MAX_ATTEMPTS) {
            throw new AppError('กรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัสใหม่', 429, [], 'TOO_MANY_ATTEMPTS');
        }
        throw new AppError('รหัสยืนยันไม่ถูกต้อง', 400, [{ attemptsLeft: MAX_ATTEMPTS - attempts }], 'INVALID_CODE');
    }

    await userRepository.markEmailVerified(user.id);
    await userRepository.deleteEmailVerification(user.id);
    return { alreadyVerified: false };
};

module.exports = {
    sendCode,
    sendCodeRespectingCooldown,
    resend,
    verify,
};
