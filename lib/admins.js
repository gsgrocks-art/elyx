import bcrypt from "bcryptjs";
import db from "./db";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

function rowToAdmin(row) {
  if (!row) return null;
  return { id: row.id, username: row.username, createdAt: row.created_at };
}

export function listAdmins() {
  return db
    .prepare("SELECT id, username, created_at FROM admins ORDER BY created_at ASC")
    .all()
    .map(rowToAdmin);
}

export function countAdmins() {
  return db.prepare("SELECT COUNT(*) as c FROM admins").get().c;
}

export function getAdminById(id) {
  return rowToAdmin(db.prepare("SELECT id, username, created_at FROM admins WHERE id = ?").get(id));
}

export function getAdminByUsername(username) {
  return rowToAdmin(
    db.prepare("SELECT id, username, created_at FROM admins WHERE username = ?").get(username)
  );
}

export function verifyCredentials(username, password) {
  const row = db.prepare("SELECT * FROM admins WHERE username = ?").get((username || "").trim());
  if (!row) return null;
  if (!bcrypt.compareSync(password || "", row.password_hash)) return null;
  return rowToAdmin(row);
}

export function createAdmin(username, password) {
  const trimmed = (username || "").trim();
  if (!USERNAME_RE.test(trimmed)) {
    throw new Error("Username must be 3-30 characters: letters, numbers, _ or - only");
  }
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters");
  }
  if (getAdminByUsername(trimmed)) {
    throw new Error(`Username "${trimmed}" is already taken`);
  }

  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).run(id, trimmed, hash, new Date().toISOString());

  return getAdminById(id);
}

export function deleteAdmin(id) {
  if (countAdmins() <= 1) {
    throw new Error("Cannot remove the last remaining admin account");
  }
  db.prepare("DELETE FROM admins WHERE id = ?").run(id);
}

export function changePassword(id, newPassword) {
  if (!newPassword || newPassword.length < 4) {
    throw new Error("New password must be at least 4 characters");
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, id);
}
