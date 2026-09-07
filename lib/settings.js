import db from "./db";

function rowToSettings(row) {
  if (!row) return null;
  return {
    businessName: row.business_name,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    whatsappNumber: row.whatsapp_number,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
  };
}

export function getSettings() {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  return rowToSettings(row);
}

export function updateSettings(data) {
  const existing = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  db.prepare(
    `UPDATE settings SET
      business_name = ?, logo_url = ?, website_url = ?, whatsapp_number = ?,
      primary_color = ?, accent_color = ?
     WHERE id = 1`
  ).run(
    data.businessName ?? existing.business_name,
    data.logoUrl !== undefined ? data.logoUrl : existing.logo_url,
    data.websiteUrl !== undefined ? data.websiteUrl : existing.website_url,
    data.whatsappNumber !== undefined ? data.whatsappNumber : existing.whatsapp_number,
    data.primaryColor ?? existing.primary_color,
    data.accentColor ?? existing.accent_color
  );
  return getSettings();
}
