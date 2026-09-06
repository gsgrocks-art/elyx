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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// e.g. "10-Sep-2026"
export function formatDate(dateInput) {
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
