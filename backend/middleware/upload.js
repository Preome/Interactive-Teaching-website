const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'classroom_contents',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'mp3', 'wav'],
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });

module.exports = upload;