import fs from "fs";
import path from "path";

// This file is the only place that touches the filesystem for uploads.
// Callers only ever deal with the public URL string it returns (stored in
// product.images / settings.logoUrl), so migrating to cloud storage later
// (S3, Cloudinary, etc.) means rewriting saveUploadedFile/deleteUploadedFile
// to call that provider's SDK instead of fs, without changing any caller.

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${subfolder}/${filename}`;
}

export function deleteUploadedFile(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const filepath = path.join(process.cwd(), "public", publicPath);
  if (fs.existsSync(filepath)) {
    try {
      fs.unlinkSync(filepath);
    } catch {
      // ignore
    }
  }
}
