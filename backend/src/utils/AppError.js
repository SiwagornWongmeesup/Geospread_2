class AppError extends Error {
    // code: รหัส error แบบคงที่ (เช่น 'EMAIL_NOT_VERIFIED') ให้ frontend เลือกข้อความตามภาษาเองได้
    constructor(message, statusCode, errors = [], code = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors; // ไว้เก็บรายละเอียดการ validate (เช่น field ไหนพัง)
        this.code = code;
        this.isOperational = true; // แยกข้อผิดพลาดที่เราคาดการณ์ไว้ (เช่น 400, 404) ออกจากบั๊กจริงๆ (500)

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
