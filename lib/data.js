import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { evaluate, parse } from "groq-js";
import { createCatalog } from "./catalog.js";

const CATALOG_QUERY = `{
  "products": *[_type == "product" && defined(slug.current)] | order(coalesce(sortOrder, 99999) asc, name asc) {
    "id": slug.current,
    name,
    "brand": brand->name,
    "brandId": brand->slug.current,
    "group": category->slug.current,
    "category": productType,
    typeLabel,
    "for": audience,
    "illustration": coalesce(illustration, category->illustration),
    optionLabel,
    "notes": scentNotes,
    "desc": description,
    "variants": sizes[]{
      "size": label,
      price,
      "inStock": coalesce(inStock, true),
      "tiers": bulkTiers[]{ "min": minQty, price }
    },
    badge,
    "photo": photo.asset->url,
    "createdAt": _createdAt
  },
  "groups": *[_type == "category" && defined(slug.current)] | order(coalesce(sortOrder, 99999) asc, title asc) {
    "id": slug.current,
    "name": title,
    "ar": arabicName,
    blurb
  },
  "bulkRules": *[_type == "bulkRule"] {
    productType,
    size,
    "tiers": bulkTiers[]{ "min": minQty, price }
  },
  "settings": *[_id == "siteSettings"][0] {
    ...,
    "footerImage": footerImage.asset->url,
    "bestsellers": bestsellers[]->slug.current,
    "courierFees": courierFees[]{ town, fee },
    "hero": heroSlides[]{
      "key": _key,
      eyebrow,
      eyebrowArabic,
      titleBefore,
      titleAccent,
      titleAfter,
      text,
      primaryLabel,
      primaryLink,
      secondaryLabel,
      secondaryLink,
      green,
      "image": image.asset->url,
      "productId": product->slug.current
    }
  }
}`;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

async function fetchFromSanity() {
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2025-10-01",
    useCdn: false, // The site is built once per publish, so it should always read the newest content.
    perspective: "published",
  });
  return client.fetch(CATALOG_QUERY);
}

/* Runs the same query on a local copy, so the site works before a Sanity project exists. */
async function fetchFromSample() {
  const file = path.join(process.cwd(), "data", "sample-dataset.json");
  const dataset = JSON.parse(await readFile(file, "utf8"));
  const result = await evaluate(parse(CATALOG_QUERY), { dataset });
  return result.get();
}

function normalizeTiers(tiers) {
  return (tiers || []).filter((t) => t.min && t.price != null).sort((a, b) => a.min - b.min);
}

function normalize(raw) {
  const groups = (raw.groups || []).map((g) => ({ ...g, ar: g.ar || "", blurb: g.blurb || "" }));
  const groupIds = new Set(groups.map((g) => g.id));

  const products = (raw.products || [])
    .filter((p) => groupIds.has(p.group))
    .map((p, idx) => {
      const variants = (p.variants || [])
        .filter((v) => v.size && v.price != null)
        .map((v) => ({ ...v, tiers: normalizeTiers(v.tiers) }));
      return {
        ...p,
        idx,
        illustration: p.illustration || "perfume",
        optionLabel: p.optionLabel || "Size",
        brand: p.brand || "",
        brandId: p.brandId || "",
        category: p.category || "",
        typeLabel: p.typeLabel || "",
        for: p.for || "",
        notes: p.notes || [],
        scent: (p.notes || []).join(", "),
        desc: p.desc || "",
        variants,
        badge: p.badge || "",
        photo: p.photo || "",
        inStock: variants.some((v) => v.inStock),
      };
    })
    .filter((p) => p.variants.length);

  const s = raw.settings || {};
  return {
    products,
    groups,
    bulkRules: (raw.bulkRules || []).map((r) => ({ ...r, tiers: normalizeTiers(r.tiers) })),
    settings: {
      ...s,
      whatsappNumber: s.whatsappNumber || "",
      whatsappDisplay: s.whatsappDisplay || "",
      address: s.address || "",
      openingHours: s.openingHours || "",
      phone: s.phone || "",
      email: s.email || "",
      promoText: s.promoText || "",
      promoPrice: s.promoPrice || "",
      deliveryText: s.deliveryText || "",
      returnsText: s.returnsText || "",
      bestsellers: (s.bestsellers || []).filter(Boolean),
      courierFees: (s.courierFees || []).filter((c) => c.town && c.fee != null),
      hero: s.hero || [],
      paymentMethods: s.paymentMethods || [],
      perks: s.perks || [],
      scentBand: s.scentBand || [],
      orderSteps: s.orderSteps || [],
    },
  };
}

export const getSiteData = cache(async () => normalize(projectId ? await fetchFromSanity() : await fetchFromSample()));

export const getCatalog = cache(async () => createCatalog(await getSiteData()));

/* A static export fails on an empty list, so a placeholder keeps the build alive until content exists. */
export const staticParams = (list, name) => (list.length ? list.map((value) => ({ [name]: value })) : [{ [name]: "none" }]);