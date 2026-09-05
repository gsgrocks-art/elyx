import { NextResponse } from "next/server";

// Lightweight edge-safe check (mirrors lib/auth.js verifySessionToken logic
// using Web Crypto, since better-sqlite3 / node:crypto HMAC sync API isn't
// available in the default edge runtime import graph). This only checks the
// signature and expiry, not whether the embedded username still exists as
// an admin account — see the note on createSessionToken in lib/auth.js.
async function isValidToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [username, expires, signature] = parts;
  if (Date.now() > Number(expires)) return false;

  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${username}.${expires}`)
  );
  const expectedHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedHex === signature;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const valid = await isValidToken(token);

  if (!valid) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
