import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  const settings = getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request) {
  const data = await request.json();
  const settings = updateSettings(data);
  return NextResponse.json({ settings });
}
