import multer from 'multer';

// Use memory storage so we can stream file buffers directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 10);
export const uploadVendorAssets = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'portfolioImages', maxCount: 10 },
]);

// CSV file upload middleware for bulk imports
export const uploadCSV = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CSV files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
}).single('csvFile');

export default upload;
