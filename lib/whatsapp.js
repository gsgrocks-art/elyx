export function buildShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildContactUrl(number, message) {
  const clean = (number || "").replace(/[^\d]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return clean ? `https://wa.me/${clean}${text}` : null;
}

export function formatPrice(price) {
  const value = Number(price) || 0;
  return `₹${value.toLocaleString("en-IN")}`;
}
