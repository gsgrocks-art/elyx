import { NextResponse } from "next/server";
import { listAdmins, createAdmin } from "@/lib/admins";

export async function GET() {
  return NextResponse.json({ admins: listAdmins() });
}

export async function POST(request) {
  const { username, password } = await request.json();

  try {
    const admin = createAdmin(username, password);
    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
