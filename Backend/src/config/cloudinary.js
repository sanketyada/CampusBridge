const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campusbridge/resources',
    resource_type: 'auto', // Important for PDFs/Docs
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx'],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campusbridge/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

module.exports = {
  cloudinary,
  resourceStorage,
  profileStorage,
};
