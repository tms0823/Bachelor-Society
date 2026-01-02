const multer = require('multer');
const path = require('path');

// Multer storage configuration (local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Local storage directory
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

// Handle multiple uploads (local storage only)
const handleMultipleUploads = async (files, folder = 'bachelor-society') => {
  // Return local file paths
  return files.map((file, index) => ({
    url: `/uploads/${file.filename}`, // Local file path
    public_id: `local_${Date.now()}_${index}`, // Local identifier
    width: 800, // Default dimensions
    height: 600
  }));
};

// Delete local file (placeholder - actual deletion handled by cleanup scripts)
const deleteFromCloudinary = async (publicId) => {
  // For local storage, we don't auto-delete files
  // They can be cleaned up manually or via backup scripts
  console.log(`Local file cleanup needed for: ${publicId}`);
  return true;
};

module.exports = {
  upload,
  deleteFromCloudinary,
  handleMultipleUploads
};
