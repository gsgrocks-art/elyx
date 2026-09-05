import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "jewellery.db");

// Reuse a single connection across hot reloads in dev.
const globalForDb = globalThis;
const db = globalForDb.__jewelleryDb || new Database(dbPath);
globalForDb.__jewelleryDb = db;

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_default INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    category_id TEXT,
    description TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    stock TEXT NOT NULL DEFAULT 'in_stock',
    is_new_arrival INTEGER NOT NULL DEFAULT 0,
    discount_percent REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    business_name TEXT NOT NULL DEFAULT 'My Jewellery Store',
    logo_url TEXT,
    website_url TEXT,
    whatsapp_number TEXT,
    primary_color TEXT NOT NULL DEFAULT '#0f3d3e',
    accent_color TEXT NOT NULL DEFAULT '#c9a227',
    admin_password_hash TEXT NOT NULL
  );
`);

const DEFAULT_CATEGORIES = [
  "Necklaces",
  "Earrings",
  "Bangles/Bracelets",
  "Rings",
  "Pendants",
  "Chains",
  "Anklets",
  "Mangalsutra",
  "Nose Pins",
  "Bridal Sets",
  "Combo Sets",
  "Hair Accessories",
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedCategories() {
  const count = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
  if (count > 0) return;
  // Uses INSERT OR IGNORE (keyed on the unique slug) because Next.js runs
  // multiple build/dev worker processes that each import this module and
  // race to seed the same on-disk database on first run.
  const insert = db.prepare(
    "INSERT OR IGNORE INTO categories (id, name, slug, is_default, sort_order) VALUES (?, ?, ?, 1, ?)"
  );
  const insertMany = db.transaction((cats) => {
    cats.forEach((name, i) => {
      insert.run(crypto.randomUUID(), name, slugify(name), i);
    });
  });
  insertMany(DEFAULT_CATEGORIES);
}

function seedSettings() {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  if (row) return;
  const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(defaultPassword, 10);
  // INSERT OR IGNORE: see seedCategories() for why this must be race-safe.
  db.prepare(
    `INSERT OR IGNORE INTO settings (id, business_name, logo_url, website_url, whatsapp_number, primary_color, accent_color, admin_password_hash)
     VALUES (1, ?, NULL, NULL, NULL, '#0f3d3e', '#c9a227', ?)`
  ).run("My Jewellery Store", hash);
}

seedCategories();
seedSettings();

export default db;
export { slugify };
