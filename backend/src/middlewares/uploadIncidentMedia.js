const multer = require('multer');
const AppError = require('../utils/AppError');
const {
    MAX_INCIDENT_MEDIA_COUNT,
    MAX_INCIDENT_MEDIA_SIZE_BYTES,
    allowedMediaMimeTypes,
} = require('../constants/incidentMedia');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_INCIDENT_MEDIA_SIZE_BYTES,
        files: MAX_INCIDENT_MEDIA_COUNT,
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMediaMimeTypes.has(file.mimetype)) {
            callback(new AppError('รองรับเฉพาะไฟล์ JPG, PNG และ MP4', 400));
            return;
        }

        callback(null, true);
    },
});

// แปลง error ของ Multer เป็นข้อความที่หน้าเว็บแสดงได้ตรงไปตรงมา
const uploadIncidentMedia = (req, res, next) => {
    upload.array('media', MAX_INCIDENT_MEDIA_COUNT)(req, res, (error) => {
        if (!error) return next();

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('ไฟล์แนบแต่ละไฟล์ต้องมีขนาดไม่เกิน 20 MB', 400));
        }

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('แนบรูปภาพหรือวิดีโอได้สูงสุด 5 ไฟล์ต่อรายงาน', 400));
        }

        return next(error);
    });
};

module.exports = uploadIncidentMedia;
