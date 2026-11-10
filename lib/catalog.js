import { norm } from "./format.js";

/* Works on the server and in the browser. Pass it the plain data from getSiteData. */
export function createCatalog(data) {
  const { products, groups, bulkRules, settings } = data;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const getGroup = (id) => groups.find((g) => g.id === id);
  const countInGroup = (id) => products.filter((p) => p.group === id).length;
  const visibleGroups = groups.filter((g) => countInGroup(g.id) > 0);

  const brands = [...new Map(products.filter((p) => p.brandId).map((p) => [p.brandId, p.brand])).entries()]
    .map(([id, name]) => ({ id, name, n: products.filter((p) => p.brandId === id).length }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));

  const rules = Object.fromEntries(bulkRules.map((r) => [`${norm(r.productType)}|${norm(r.size)}`, r.tiers]));

  function tiersFor(product, size) {
    const variant = product.variants.find((v) => v.size === size);
    if (variant?.tiers.length) return variant.tiers;
    return rules[`${norm(product.category)}|${norm(size)}`] || [];
  }

  function unitPrice(product, variant, qty) {
    let unit = variant.price;
    tiersFor(product, variant.size).forEach((t) => {
      if (qty >= t.min) unit = t.price;
    });
    return unit;
  }

  const newestFirst = (a, b) => (b.createdAt || "").localeCompare(a.createdAt || "") || b.idx - a.idx;

  function bestsellerProducts() {
    const list = [...settings.bestsellers.map((id) => byId[id]).filter(Boolean), ...products.filter((p) => p.badge === "bestseller")];
    return list.filter((p, i, all) => all.indexOf(p) === i);
  }

  function latestProducts() {
    const list = [...products.filter((p) => p.badge === "new"), ...[...products].sort(newestFirst)];
    return list.filter((p, i, all) => all.indexOf(p) === i && p.inStock).slice(0, 8);
  }

  function relatedProducts(product) {
    const list = [
      ...products.filter((x) => x.id !== product.id && (x.group === product.group || (product.brandId && x.brandId === product.brandId))),
      ...products.filter((x) => x.id !== product.id),
    ];
    return list.filter((x, i, all) => all.indexOf(x) === i).slice(0, 6);
  }

  return {
    ...data,
    byId,
    brands,
    visibleGroups,
    getGroup,
    countInGroup,
    tiersFor,
    unitPrice,
    newestFirst,
    bestsellerProducts,
    latestProducts,
    relatedProducts,
  };
}

export const minPrice = (p) => Math.min(...p.variants.map((v) => v.price));

export const firstAvailable = (p) => p.variants.find((v) => v.inStock) || p.variants[0];

export function productFlag(p) {
  if (!p.inStock) return ["Out of stock", "o"];
  if (p.badge === "bestseller") return ["Bestseller", "b"];
  if (p.badge === "new") return ["New", "n"];
  return null;
}

export const typeLine = (p, group) => p.typeLabel || p.category || group?.name || "";
