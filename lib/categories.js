import db, { slugify } from "./db";

export function listCategories() {
  return db.prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC").all();
}

export function getCategoryById(id) {
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
}

export function getCategoryBySlug(slug) {
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug);
}

export function createCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name is required");
  const slug = slugify(trimmed);
  const existing = getCategoryBySlug(slug);
  if (existing) return existing;
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM categories").get().m || 0;
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO categories (id, name, slug, is_default, sort_order) VALUES (?, ?, ?, 0, ?)"
  ).run(id, trimmed, slug, maxOrder + 1);
  return getCategoryById(id);
}

export function deleteCategory(id) {
  db.prepare("UPDATE products SET category_id = NULL WHERE category_id = ?").run(id);
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

export function countProductsInCategory(id) {
  return db.prepare("SELECT COUNT(*) as c FROM products WHERE category_id = ?").get(id).c;
}
