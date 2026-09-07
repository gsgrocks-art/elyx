import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadsRoot } from "@/lib/upload";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// Serves uploaded product photos/logo from outside `public/` (see
// lib/upload.js) so the same code path works whether files live in the
// default local `uploads/` folder or on a deployed host's mounted volume.
export async function GET(request, { params }) {
  const { path: segments } = await params;

  const root = path.resolve(getUploadsRoot());
  const filepath = path.resolve(root, ...segments);

  // Reject any resolved path that escapes the uploads root (e.g. via `..`).
  if (!filepath.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filepath).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  // turbopackIgnore: filepath is a plain local/mounted-volume path derived
  // from getUploadsRoot(), never something to bundle.
  if (!contentType || !fs.existsSync(/*turbopackIgnore: true*/ filepath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(/*turbopackIgnore: true*/ filepath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
