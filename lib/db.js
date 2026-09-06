import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// This file is the only place that opens a database connection. Every other
// module (products.js, categories.js, settings.js, admins.js) imports `db`
// from here and speaks plain SQL — so moving off local SQLite later (e.g. to
// Postgres) means changing this file's connection setup plus the query
// syntax in those modules, without touching API routes or components.

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
// turbopackIgnore: DATA_DIR is only ever a plain local/mounted-volume path,
// never something to bundle — see the comment above.
if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
  fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
}

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
    buying_cost REAL,
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
    primary_color TEXT NOT NULL DEFAULT '#3d1560',
    accent_color TEXT NOT NULL DEFAULT '#e6007e'
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    mobile_number TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    total_items INTEGER NOT NULL,
    order_total REAL NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'processing',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    delivery_charges REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_code TEXT,
    product_image TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
`);

// `CREATE TABLE IF NOT EXISTS` above only shapes a brand-new database — it
// is a no-op against a table that already exists, so a column added here
// later needs to be added explicitly to already-deployed databases too.
// This runs on every boot and is a cheap no-op once the column exists.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("products", "buying_cost", "REAL");
ensureColumn("orders", "delivery_charges", "REAL NOT NULL DEFAULT 0");

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
  // INSERT OR IGNORE: see seedCategories() for why this must be race-safe.
  db.prepare(
    `INSERT OR IGNORE INTO settings (id, business_name, logo_url, website_url, whatsapp_number, primary_color, accent_color)
     VALUES (1, ?, NULL, NULL, NULL, '#3d1560', '#e6007e')`
  ).run("My Jewellery Store");
}

function seedAdmin() {
  const count = db.prepare("SELECT COUNT(*) as c FROM admins").get().c;
  if (count > 0) return;
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(password, 10);
  // INSERT OR IGNORE: see seedCategories() for why this must be race-safe.
  db.prepare(
    "INSERT OR IGNORE INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).run(crypto.randomUUID(), username, hash, new Date().toISOString());
}

seedCategories();
seedSettings();
seedAdmin();

export default db;
export { slugify };
