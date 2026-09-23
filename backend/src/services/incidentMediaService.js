const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/AppError');
const { allowedMediaMimeTypes, getMediaType } = require('../constants/incidentMedia');

const cloudinaryConfiguration = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinaryConfiguration);

const isCloudinaryConfigured = () => Object.values(cloudinaryConfiguration).every(Boolean);

const uploadIncidentMedia = async (file) => {
    if (!file) return null;

    if (!allowedMediaMimeTypes.has(file.mimetype)) {
        throw new AppError('รองรับเฉพาะไฟล์ JPG, PNG และ MP4', 400);
    }

    if (!isCloudinaryConfigured()) {
        throw new AppError('ระบบอัปโหลดไฟล์ยังไม่ได้ตั้งค่า', 503);
    }

    const mediaType = getMediaType(file.mimetype);

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'geospread/incident-reports',
                resource_type: mediaType,
                use_filename: true,
                unique_filename: true,
            },
            (error, uploadResult) => {
                if (error) return reject(error);
                return resolve(uploadResult);
            },
        );

        stream.end(file.buffer);
    });

    return {
        media_type: mediaType,
        media_url: result.secure_url,
        public_id: result.public_id,
    };
};

const deleteIncidentMedia = async (media) => {
    if (!media?.public_id || !isCloudinaryConfigured()) return;

    await cloudinary.uploader.destroy(media.public_id, {
        resource_type: media.media_type,
        invalidate: true,
    });
};

module.exports = {
    uploadIncidentMedia,
    deleteIncidentMedia,
};
