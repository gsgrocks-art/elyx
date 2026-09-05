import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type") === "logo" ? "logo" : "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await saveUploadedFile(file, type);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 400 });
  }
}
