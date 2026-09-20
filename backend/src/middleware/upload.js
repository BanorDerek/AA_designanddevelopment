const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const r2 = require('../config/r2');

// Map file extensions to MIME types
const mimeTypeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const fileFilter = (req, file, cb) => {
  // Check by MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  
  // Also check by file extension (for cases where MIME type isn't recognized)
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMime = allowedMimeTypes.includes(file.mimetype);
  const isValidExt = Object.keys(mimeTypeMap).includes(ext);
  
  if (isValidMime || isValidExt) {
    console.log(`✅ File accepted: ${file.originalname} (MIME: ${file.mimetype}, Ext: ${ext})`);
    cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname} (MIME: ${file.mimetype}, Ext: ${ext})`);
    cb(new Error('Only JPEG, PNG, WEBP, or AVIF images are allowed'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

async function uploadToR2(file, keyPrefix = 'uploads') {
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Determine correct MIME type (fallback to extension if MIME is missing)
  let contentType = file.mimetype;
  if (!contentType || contentType === 'application/octet-stream') {
    // If MIME type isn't recognized, try to get it from the extension
    const mappedMime = mimeTypeMap[ext];
    if (mappedMime) {
      contentType = mappedMime;
      console.log(`🔍 MIME type detected from extension: ${contentType}`);
    }
  }
  
  // Generate unique filename
  const objectKey = `${keyPrefix}/${uuidv4()}${ext}`;
  
  console.log(`📤 Uploading to R2: ${objectKey}`);
  console.log(`📄 Content-Type: ${contentType}`);
  console.log(`📦 File size: ${(file.size / 1024).toFixed(2)} KB`);

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    Body: file.buffer,
    ContentType: contentType,
  }));

  const url = `${process.env.R2_PUBLIC_URL}/${objectKey}`;
  console.log(`✅ Upload complete: ${url}`);
  
  return url;
}

async function deleteFromR2(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith(process.env.R2_PUBLIC_URL)) return;
  const objectKey = imageUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');
  try {
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    }));
    console.log(`🗑️ Deleted from R2: ${objectKey}`);
  } catch (err) {
    console.error('[deleteFromR2] Failed to delete object:', err);
  }
}

module.exports = { upload, uploadToR2, deleteFromR2 };