export const money = (n) => `P${n.toFixed(2)}`;

export const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
