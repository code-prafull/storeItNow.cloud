const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // 25 MB per-file cap (ImageKit free tier se pehle hi rok do)
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;