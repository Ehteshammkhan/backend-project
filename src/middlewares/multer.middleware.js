// multer.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Use absolute paths to avoid issues with file paths
const uploadDir = path.join(process.cwd(), "public/temp");

// Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use absolute path to avoid path issues
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
