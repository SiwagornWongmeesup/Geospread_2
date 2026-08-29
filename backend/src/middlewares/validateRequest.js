// const { validationResult } = require('express-validator');
// const AppError = require('../utils/AppError');

// const validateRequest = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         // จัดรูปแบบ error ให้อ่านง่ายขึ้น (array of { field, message })
//         const formattedErrors = errors.array().map(err => ({
//             field: err.path,
//             message: err.msg
//         }));

//         // โยน AppError กลับไปพร้อม status 400
//         return next(new AppError('Validation failed', 400, formattedErrors));
//     }
    
//     // ถ้าผ่านหมด ให้ไปทำงานต่อ
//     next();
// };

// module.exports = validateRequest;
