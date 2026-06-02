import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ── Resolve __dirname correctly in ES modules ──────────────────────────────
// This is the KEY fix: always resolve relative to THIS file, not process.cwd()
// so multer and express.static always agree on where files live.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the project root's uploads folder
// Adjust the number of ".." if this file is nested deeper than one level
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Storage ────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the MIME base type only (strip codec params like ";codecs=opus")
    // e.g. "audio/webm;codecs=opus" → "audio/webm" → base "audio"
    const mimeBase = file.mimetype.split(";")[0].trim();
    const mimeType = mimeBase.split("/")[0]; // "audio" | "image" | "video" etc.

    let subFolder;
    if (mimeType === "image" || mimeType === "video") {
      subFolder = "media";
    } else if (mimeType === "audio") {
      subFolder = "audio";
    } else {
      subFolder = "files";
    }

    // Always absolute so multer and static serving agree
    const dest = path.join(UPLOADS_ROOT, subFolder);
    ensureDir(dest);
    cb(null, dest);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Preserve original extension; fallback for extensionless files
    const ext = path.extname(file.originalname) || _mimeToExt(file.mimetype);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ── MIME → extension fallback for browser-recorded audio ──────────────────
// The browser gives originalname like "blob" with no extension.
// We derive the extension from the MIME type in that case.
function _mimeToExt(mimetype) {
  const base = mimetype.split(";")[0].trim();
  const map = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/mp4": ".m4a",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/aac": ".aac",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return map[base] || "";
}

// ── File filter ────────────────────────────────────────────────────────────
// FIX: strip codec params before comparing so "audio/webm;codecs=opus" passes
const ALLOWED_MIME_BASES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/webm",   // browser MediaRecorder default (Chrome, Firefox)
  "audio/ogg",    // Firefox fallback
  "audio/mp4",    // Safari / iOS
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/aac",
  "audio/x-m4a",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const fileFilter = (req, file, cb) => {
  // Strip ";codecs=opus" and similar parameters before checking
  const mimeBase = file.mimetype.split(";")[0].trim().toLowerCase();

  if (ALLOWED_MIME_BASES.has(mimeBase)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed`), false);
  }
};

// ── Export ────────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — matches Flutter side
});

export default upload;