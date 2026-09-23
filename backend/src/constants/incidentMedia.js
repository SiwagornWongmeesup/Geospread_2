const MAX_INCIDENT_MEDIA_COUNT = 5;
const MAX_INCIDENT_MEDIA_SIZE_BYTES = 20 * 1024 * 1024;

const allowedMediaMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'video/mp4',
]);

const getMediaType = (mimetype) => mimetype.startsWith('video/') ? 'video' : 'image';

module.exports = {
    MAX_INCIDENT_MEDIA_COUNT,
    MAX_INCIDENT_MEDIA_SIZE_BYTES,
    allowedMediaMimeTypes,
    getMediaType,
};
