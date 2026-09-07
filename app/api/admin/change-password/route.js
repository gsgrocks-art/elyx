import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { verifyCredentials, changePassword } from "@/lib/admins";

export async function POST(request) {
  const { currentPassword, newPassword } = await request.json();

  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!verifyCredentials(admin.username, currentPassword)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  try {
    changePassword(admin.id, newPassword);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
