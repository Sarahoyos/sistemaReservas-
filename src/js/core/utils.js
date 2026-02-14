export function uid(prefix = "id") {
  // Modern browsers: crypto.randomUUID()
  const id = (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`);
  return `${prefix}_${id}`;
}

export function nowISODate() {
  // YYYY-MM-DD (local)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isISODate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function toDateAtMidnight(iso) {
  // create Date in local time at 00:00
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function daysDiff(aISO, bISO) {
  const a = toDateAtMidnight(aISO).getTime();
  const b = toDateAtMidnight(bISO).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}
export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function formatDate(iso) {
  if (!isISODate(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
