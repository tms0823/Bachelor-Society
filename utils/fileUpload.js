const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary (with fallback for missing config)
let cloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
    process.env.CLOUDINARY_API_KEY !== 'demo_key' &&
    process.env.CLOUDINARY_API_SECRET !== 'demo_secret') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  cloudinaryConfigured = true;
} else {
  console.log('Cloudinary not configured or using demo credentials - using mock uploads for development');
}

// Multer storage configuration (temporary local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temporary storage
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'bachelor-society') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Resize
        { quality: 'auto' } // Auto quality
      ]
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    throw new Error('Failed to upload image: ' + error.message);
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};

// Handle multiple uploads
const handleMultipleUploads = async (files, folder = 'bachelor-society') => {
  if (!cloudinaryConfigured) {
    // Return mock photo data for development when Cloudinary is not configured
    return files.map((file, index) => ({
      url: `/uploads/${file.filename}`, // Local file path
      public_id: `mock_${Date.now()}_${index}`,
      width: 800,
      height: 600
    }));
  }

  const uploadPromises = files.map(file => uploadToCloudinary(file.path, folder));
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error('Failed to upload images: ' + error.message);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  handleMultipleUploads
};
