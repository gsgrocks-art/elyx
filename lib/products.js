import db from "./db";

const CODE_PREFIX = "JWL";

// buying_cost is admin-only accounting data (see lib/db.js) and must never
// reach a public page or API response. Callers only get it back when they
// explicitly pass { includeCost: true } — admin routes/pages do; public
// catalog pages never do, so a leak requires an active opt-in, not an
// oversight.
function rowToProduct(row, { includeCost = false } = {}) {
  if (!row) return null;
  const product = {
    ...row,
    images: JSON.parse(row.images || "[]"),
    isNewArrival: !!row.is_new_arrival,
    discountPercent: row.discount_percent,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeCost) {
    product.buyingCost = row.buying_cost;
  } else {
    delete product.buying_cost;
  }
  return product;
}

export function generateProductCode() {
  const rows = db
    .prepare("SELECT code FROM products WHERE code LIKE ?")
    .all(`${CODE_PREFIX}-%`);
  let maxNum = 0;
  for (const { code } of rows) {
    const match = code.match(/^JWL-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `${CODE_PREFIX}-${String(next).padStart(4, "0")}`;
}

export function listProducts({ categorySlug, categoryId, search, stock, includeCost = false } = {}) {
  let query = `
    SELECT products.*, categories.name as category_name, categories.slug as category_slug
    FROM products
    LEFT JOIN categories ON categories.id = products.category_id
    WHERE 1=1
  `;
  const params = [];

  if (categorySlug) {
    query += " AND categories.slug = ?";
    params.push(categorySlug);
  }
  if (categoryId) {
    query += " AND products.category_id = ?";
    params.push(categoryId);
  }
  if (stock) {
    query += " AND products.stock = ?";
    params.push(stock);
  }
  if (search) {
    query += " AND (products.name LIKE ? OR products.code LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like);
  }

  query += " ORDER BY products.created_at DESC";

  const rows = db.prepare(query).all(...params);
  return rows.map((row) => rowToProduct(row, { includeCost }));
}

export function getProductById(id, { includeCost = false } = {}) {
  const row = db
    .prepare(
      `SELECT products.*, categories.name as category_name, categories.slug as category_slug
       FROM products LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.id = ?`
    )
    .get(id);
  return rowToProduct(row, { includeCost });
}

export function getProductByCode(code) {
  const row = db
    .prepare(
      `SELECT products.*, categories.name as category_name, categories.slug as category_slug
       FROM products LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.code = ?`
    )
    .get(code);
  return rowToProduct(row);
}

export function createProduct(data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const code = data.code && data.code.trim() ? data.code.trim() : generateProductCode();

  db.prepare(
    `INSERT INTO products
      (id, code, name, price, category_id, description, images, stock, is_new_arrival, discount_percent, buying_cost, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    code,
    data.name,
    data.price || 0,
    data.categoryId || null,
    data.description || "",
    JSON.stringify(data.images || []),
    data.stock || "in_stock",
    data.isNewArrival ? 1 : 0,
    data.discountPercent ?? null,
    data.buyingCost ?? null,
    now,
    now
  );

  return getProductById(id, { includeCost: true });
}

export function updateProduct(id, data) {
  const existing = getProductById(id, { includeCost: true });
  if (!existing) throw new Error("Product not found");

  const now = new Date().toISOString();
  const code = data.code && data.code.trim() ? data.code.trim() : existing.code;

  db.prepare(
    `UPDATE products SET
      code = ?, name = ?, price = ?, category_id = ?, description = ?,
      images = ?, stock = ?, is_new_arrival = ?, discount_percent = ?, buying_cost = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    code,
    data.name ?? existing.name,
    data.price ?? existing.price,
    data.categoryId ?? existing.categoryId,
    data.description ?? existing.description,
    JSON.stringify(data.images ?? existing.images),
    data.stock ?? existing.stock,
    data.isNewArrival !== undefined ? (data.isNewArrival ? 1 : 0) : existing.is_new_arrival,
    data.discountPercent !== undefined ? data.discountPercent : existing.discountPercent,
    data.buyingCost !== undefined ? data.buyingCost : existing.buyingCost,
    now,
    id
  );

  return getProductById(id, { includeCost: true });
}

export function deleteProduct(id) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function isCodeTaken(code, excludeId) {
  const row = excludeId
    ? db.prepare("SELECT id FROM products WHERE code = ? AND id != ?").get(code, excludeId)
    : db.prepare("SELECT id FROM products WHERE code = ?").get(code);
  return !!row;
}
