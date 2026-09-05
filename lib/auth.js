import crypto from "crypto";
import { cookies } from "next/headers";
import { getAdminByUsername } from "./admins";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(value) {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(value);
  return hmac.digest("hex");
}

// The token embeds the logged-in admin's username so multiple staff can be
// signed in independently. It's a signed cookie, not a DB-backed session:
// removing a staff account takes effect on their next login, not instantly
// on an already-issued cookie (which expires within SESSION_MAX_AGE anyway).
export function createSessionToken(username) {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

// Verifies the signature/expiry only (see note above). Returns the username
// embedded in the token, or null if invalid/expired.
export function verifySessionToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expires, signature] = parts;
  const payload = `${username}.${expires}`;
  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return null;
  if (Date.now() > Number(expires)) return null;
  return username;
}

// Server-only helper for pages/route handlers to find out which admin is
// currently logged in (e.g. to scope "change my password" or show "signed
// in as ..."). Confirms the account still exists, unlike verifySessionToken.
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const username = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!username) return null;
  return getAdminByUsername(username);
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
