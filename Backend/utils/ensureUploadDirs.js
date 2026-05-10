import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix #3: create all upload sub-folders at startup so multer never crashes on first upload
const UPLOAD_DIRS = [
  "uploads/media",
  "uploads/files",
  "uploads/audio",
  "uploads/misc",
];

export const ensureUploadDirs = () => {
  UPLOAD_DIRS.forEach((dir) => {
    const fullPath = path.join(__dirname, "..", dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created upload directory: ${dir}`);
    }
  });
};
