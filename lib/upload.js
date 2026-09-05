import fs from "fs";
import path from "path";

// This file is the only place that touches the filesystem for uploads.
// Callers only ever deal with the public URL string it returns (stored in
// product.images / settings.logoUrl), so migrating to cloud storage later
// (S3, Cloudinary, etc.) means rewriting saveUploadedFile/deleteUploadedFile
// to call that provider's SDK instead of fs, without changing any caller.
//
// Files live outside `public/` (default: <project root>/uploads, or
// UPLOADS_DIR if set) and are served by app/uploads/[...path]/route.js
// instead of Next's static file serving. This keeps one code path for both
// local dev and a deployed host with a persistent volume — see README
// "Deploying" for pointing UPLOADS_DIR (and DATA_DIR) at a mounted volume.

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function getUploadsRoot() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

export async function saveUploadedFile(file, subfolder) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Invalid file");
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Unsupported file type. Please upload JPG, PNG, WEBP, or GIF images.");
  }
  const maxBytes = 8 * 1024 * 1024; // 8MB
  if (file.size > maxBytes) {
    throw new Error("File is too large. Max size is 8MB.");
  }

  // turbopackIgnore: UPLOADS_DIR is only ever a plain local/mounted-volume
  // path, never something to bundle — see the module comment above.
  const uploadDir = path.join(/*turbopackIgnore: true*/ getUploadsRoot(), subfolder);
  if (!fs.existsSync(/*turbopackIgnore: true*/ uploadDir)) {
    fs.mkdirSync(/*turbopackIgnore: true*/ uploadDir, { recursive: true });
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(/*turbopackIgnore: true*/ uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(/*turbopackIgnore: true*/ filepath, buffer);

  return `/uploads/${subfolder}/${filename}`;
}

export function deleteUploadedFile(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const relative = publicPath.slice("/uploads/".length);
  const filepath = path.join(/*turbopackIgnore: true*/ getUploadsRoot(), relative);
  if (fs.existsSync(/*turbopackIgnore: true*/ filepath)) {
    try {
      fs.unlinkSync(/*turbopackIgnore: true*/ filepath);
    } catch {
      // ignore
    }
  }
}
