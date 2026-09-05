import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "./db";

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

export function createSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expires, signature] = parts;
  const payload = `${role}.${expires}`;
  const expected = sign(payload);
  if (expected.length !== signature.length) return false;
  const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return false;
  if (Date.now() > Number(expires)) return false;
  return true;
}

export function checkPassword(password) {
  const settings = db.prepare("SELECT admin_password_hash FROM settings WHERE id = 1").get();
  if (!settings) return false;
  return bcrypt.compareSync(password, settings.admin_password_hash);
}

export function setPassword(newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE settings SET admin_password_hash = ? WHERE id = 1").run(hash);
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
