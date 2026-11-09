const jwt = require('jsonwebtoken');

/**
 * optionalAuthMiddleware
 * -----------------------------------------------------------------------
 * ใช้กับหน้าที่ใครก็เปิดดูได้ แต่ถ้าล็อกอินอยู่จะเห็นข้อมูลเพิ่ม
 * (เช่น หน้ารายละเอียดคำขอความช่วยเหลือ: เจ้าของเห็นรายการข้อเสนอ ผู้ช่วยที่ได้รับอนุมัติเห็นเบอร์โทร)
 *
 * - มี token ที่ถูกต้อง → แนบ req.user แล้วไปต่อ
 * - ไม่มี token หรือ token ผิด/หมดอายุ → ไปต่อแบบไม่ล็อกอิน (req.user = null) ไม่ตอบ 401
 * -----------------------------------------------------------------------
 */
const optionalAuthMiddleware = (req, res, next) => {
    req.user = null;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // token ใช้ไม่ได้: ถือว่าเป็นคนที่ยังไม่ล็อกอิน
        req.user = null;
    }
    next();
};

module.exports = optionalAuthMiddleware;
