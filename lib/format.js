export const money = (n) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return "P0";
  return Number.isInteger(value) ? `P${value}` : `P${value.toFixed(2)}`;
};

export const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const TITLE_SMALL = new Set(["a", "an", "and", "as", "at", "by", "de", "for", "in", "of", "on", "or", "the", "to", "vs", "via"]);

/* Turns spreadsheet-style ALL CAPS names into Title Case for the shop. */
export function titleCaseName(name) {
  if (!name) return name;
  return String(name)
    .trim()
    .split(/(\s+|[()\/\-–—])/g)
    .map((part, i, parts) => {
      if (!part || /^\s+$/.test(part) || /^[()\/\-–—]$/.test(part)) return part;
      const lower = part.toLowerCase();
      const isFirst = parts.slice(0, i).every((p) => !p.trim() || /^[()\/\-–—]$/.test(p));
      const isLast = parts.slice(i + 1).every((p) => !p.trim() || /^[()\/\-–—]$/.test(p));
      if (!isFirst && !isLast && TITLE_SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export const paragraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/* Adds Sanity's resize options to its image links. Local sample photos are left as they are. */
export function imageUrl(url, width) {
  if (!url) return "";
  if (!url.includes("cdn.sanity.io")) return url;
  return `${url}?w=${width}&h=${width}&fit=crop&auto=format`;
}
