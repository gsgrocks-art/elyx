import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/admins";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  const { username, password } = await request.json();

  const admin = verifyCredentials(username, password);
  if (!admin) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  const token = createSessionToken(admin.username);
  const response = NextResponse.json({ ok: true, username: admin.username });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
