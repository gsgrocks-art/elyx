import { NextResponse } from "next/server";
import { checkPassword, setPassword } from "@/lib/auth";

export async function POST(request) {
  const { currentPassword, newPassword } = await request.json();

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json(
      { error: "New password must be at least 4 characters" },
      { status: 400 }
    );
  }

  if (!checkPassword(currentPassword)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  setPassword(newPassword);
  return NextResponse.json({ ok: true });
}
