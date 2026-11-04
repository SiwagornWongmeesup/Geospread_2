// ส่งอีเมลผ่าน Gmail (nodemailer + App Password)
// ถ้ายังไม่ได้ตั้ง GMAIL_USER / GMAIL_USER ใน .env และไม่ใช่ production
// จะพิมพ์อีเมลลง console แทน เพื่อให้ทดสอบ flow ได้โดยไม่ต้องตั้งค่า Gmail
const nodemailer = require('nodemailer');
const AppError = require('../utils/AppError');

let transporter = null;

const getAppPassword = () => process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;

const isMailConfigured = () => Boolean(process.env.GMAIL_USER && getAppPassword());

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                // App Password 16 ตัวจาก Google Account (ไม่ใช่รหัสผ่าน Gmail ปกติ)
                pass: getAppPassword(),
            },
        });
    }
    return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
    if (!isMailConfigured()) {
        if (process.env.NODE_ENV === 'production') {
            throw new AppError('ระบบส่งอีเมลยังไม่ได้ตั้งค่า', 500);
        }
        return;
    }

    try {
        await getTransporter().sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'GeoSpread'}" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error('ส่งอีเมลไม่สำเร็จ:', error.message);
        throw new AppError('ส่งอีเมลไม่สำเร็จ กรุณาลองส่งรหัสใหม่อีกครั้ง', 502, [], 'EMAIL_SEND_FAILED');
    }
};

// อีเมลรหัสยืนยัน 6 หลัก (ภาษาไทยและอังกฤษในฉบับเดียว เพราะยังไม่รู้ภาษาที่ผู้ใช้เลือก)
const sendVerificationCode = (to, code, expiresInMinutes) => {
    const text = [
        `รหัสยืนยันอีเมล GeoSpread ของคุณคือ ${code}`,
        `รหัสนี้ใช้ได้ ${expiresInMinutes} นาที ถ้าคุณไม่ได้สมัคร GeoSpread ไม่ต้องทำอะไร`,
        '',
        `Your GeoSpread verification code is ${code}`,
        `It expires in ${expiresInMinutes} minutes. If you did not sign up, you can ignore this email.`,
    ].join('\n');

    const html = `
        <div style="font-family: system-ui, sans-serif; color: #102968; max-width: 420px">
            <p style="margin: 0 0 12px">รหัสยืนยันอีเมล GeoSpread ของคุณ</p>
            <p style="margin: 0 0 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px">${code}</p>
            <p style="margin: 0 0 20px; color: #3f5a80">รหัสนี้ใช้ได้ ${expiresInMinutes} นาที ถ้าคุณไม่ได้สมัคร GeoSpread ไม่ต้องทำอะไร</p>
            <p style="margin: 0; color: #52708b; font-size: 13px">Your GeoSpread verification code is ${code}. It expires in ${expiresInMinutes} minutes.</p>
        </div>`;

    return sendMail({ to, subject: `${code} คือรหัสยืนยัน GeoSpread ของคุณ`, text, html });
};

// ทดสอบว่าเข้าสู่ระบบ Gmail ได้ไหม โดยไม่ส่งอีเมลจริง
const verifyConnection = () => getTransporter().verify();

module.exports = {
    isMailConfigured,
    verifyConnection,
    sendMail,
    sendVerificationCode,
};
