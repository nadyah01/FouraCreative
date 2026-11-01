const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'public', 'uploads');
const FOLDER = { image: 'product_images', gambar_tambahan: 'media_files' };
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, FOLDER[file.fieldname] || 'media_files');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + ALLOWED[file.mimetype]),
});

const uploader = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Format gambar harus JPG, PNG, WEBP, atau GIF.')),
});

// path relatif yang disimpan di database, mis. "product_images/abc.jpg"
const relPath = (file) => path.posix.join(FOLDER[file.fieldname] || 'media_files', file.filename);

function removeFile(rel) {
  if (!rel) return;
  const full = path.join(UPLOAD_ROOT, rel);
  if (full.startsWith(UPLOAD_ROOT)) fs.unlink(full, () => {});
}

// Jalankan multer dan ubah error upload jadi pesan biasa (req.uploadError)
function handleUpload(fields) {
  const mw = uploader.fields(fields);
  return (req, res, next) => mw(req, res, (err) => {
    if (err) req.uploadError = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 2 MB.' : err.message;
    next();
  });
}

const uploadedFiles = (req) => Object.values(req.files || {}).flat();

module.exports = { handleUpload, relPath, removeFile, uploadedFiles };
