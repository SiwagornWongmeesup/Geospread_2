const multer = require('multer');
const AppError = require('../utils/AppError');
const {
    MAX_INCIDENT_MEDIA_COUNT,
    MAX_INCIDENT_MEDIA_SIZE_BYTES,
} = require('../constants/incidentMedia');

// คำขอความช่วยเหลือรับเฉพาะรูป (ฟอร์มให้เลือกแค่ JPG/PNG) จำนวนและขนาดเท่ากับรายงานเหตุ
const allowedHelpImageTypes = new Set(['image/jpeg', 'image/png']);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_INCIDENT_MEDIA_SIZE_BYTES,
        files: MAX_INCIDENT_MEDIA_COUNT,
    },
    fileFilter: (req, file, callback) => {
        if (!allowedHelpImageTypes.has(file.mimetype)) {
            callback(new AppError('รองรับเฉพาะรูป JPG และ PNG', 400));
            return;
        }
        callback(null, true);
    },
});

// แปลง error ของ Multer เป็นข้อความที่หน้าเว็บแสดงได้ตรงไปตรงมา
const uploadHelpRequestMedia = (req, res, next) => {
    upload.array('media', MAX_INCIDENT_MEDIA_COUNT)(req, res, (error) => {
        if (!error) {
            return next();
        }
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('รูปแต่ละรูปต้องมีขนาดไม่เกิน 20 MB', 400));
        }
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('แนบรูปได้สูงสุด 5 รูปต่อคำขอ', 400));
        }
        return next(error);
    });
};

module.exports = uploadHelpRequestMedia;
