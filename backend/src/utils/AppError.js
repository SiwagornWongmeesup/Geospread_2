class AppError extends Error {
    constructor(message, statusCode, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors; // ไว้เก็บรายละเอียดการ validate (เช่น field ไหนพัง)
        this.isOperational = true; // แยกข้อผิดพลาดที่เราคาดการณ์ไว้ (เช่น 400, 404) ออกจากบั๊กจริงๆ (500)

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
