const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadConfig } = require('../config/security');

// -------------------- Configuration mémoire (sécurisé pour Cloudinary) --------------------
const storage = multer.memoryStorage(); // Buffer en mémoire seulement - pas de disque


// -------------------- Filtrage type de fichier --------------------
const fileFilter = (req, file, cb) => {
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// -------------------- Middleware Multer --------------------
const upload = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter
});

module.exports = upload;
