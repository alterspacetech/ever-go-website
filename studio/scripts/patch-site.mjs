import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const env = readFileSync(path.join(root, "../.env"), "utf8");
const token = env.match(/SANITY_WRITE_TOKEN=(.*)/)?.[1]?.trim();
const projectId = env.match(/SANITY_STUDIO_PROJECT_ID=(.*)/)?.[1]?.trim() || "sk91mcdf";
const dataset = env.match(/SANITY_STUDIO_DATASET=(.*)/)?.[1]?.trim() || "production";

if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN in studio/.env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-10-01",
  useCdn: false,
  token,
});

const SMALL = new Set(["a", "an", "and", "as", "at", "by", "de", "for", "in", "of", "on", "or", "the", "to", "vs", "via"]);

function titleCase(name) {
  if (!name) return name;
  return name
    .trim()
    .split(/(\s+|[()\/\-–—])/g)
    .map((part, i, parts) => {
      if (!part || /^\s+$/.test(part) || /^[()\/\-–—]$/.test(part)) return part;
      const lower = part.toLowerCase();
      const isFirst = parts.slice(0, i).every((p) => !p.trim() || /^[()\/\-–—]$/.test(p));
      const isLast = parts.slice(i + 1).every((p) => !p.trim() || /^[()\/\-–—]$/.test(p));
      if (!isFirst && !isLast && SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

const mode = process.argv[2] || "patch";

if (mode === "inspect") {
  const settings = await client.fetch(`*[_id == "siteSettings"][0]{
    whatsappNumber, whatsappDisplay, promoText, promoPrice, heroSlides,
    collectionsTitle, collectionsIntro, latestTitle, latestIntro,
    bestsellersTitle, bestsellersIntro, sourceTitle, sourceText, sourceButton,
    stepsTitle, orderSteps, brandsTitle, brandsHomeIntro, brandsIntro,
    signupTitle, signupText, footerBlurb, shopIntro, specialOrdersIntro,
    scentsTitle, perks, scentBand, deliveryLine, priceNote
  }`);
  const products = await client.fetch(`*[_type=="product"]{ _id, name, "sizes": sizes[]{label, price} } | order(name asc)`);
  const cats = await client.fetch(`*[_type=="category"]{ _id, title, blurb, "slug": slug.current }`);
  console.log(JSON.stringify({ settings, products, cats }, null, 2));
  process.exit(0);
}

const products = await client.fetch(`*[_type=="product"]{ _id, name }`);
const tx = client.transaction();

tx.patch("siteSettings", {
  set: {
    whatsappNumber: "26771779845",
    whatsappDisplay: "+267 71 779 845",
    promoText: "Perfumes from",
    promoPrice: "P350",
    heroSlides: [
      {
        _type: "heroSlide",
        _key: "slide1",
        eyebrow: "Welcome to EVER-GO",
        eyebrowArabic: "أهلاً",
        titleBefore: "Arabian ",
        titleAccent: "perfumes",
        titleAfter: " for Botswana",
        text: "Lattafa, Armaf and more. Fill your bag and order on WhatsApp.",
        primaryLabel: "Shop all products",
        primaryLink: "/shop",
        secondaryLabel: "Shop by brand",
        secondaryLink: "/brands",
        green: false,
      },
      {
        _type: "heroSlide",
        _key: "slide2",
        eyebrow: "Our range",
        titleBefore: "100 ml perfumes from ",
        titleAccent: "P350.",
        text: "Choose by how it smells. Buying for a shop? Bulk prices apply on their own.",
        primaryLabel: "Shop perfumes",
        primaryLink: "/shop/perfumes",
        green: true,
      },
      {
        _type: "heroSlide",
        _key: "slide3",
        eyebrow: "Need something else?",
        titleBefore: "Ask us to ",
        titleAccent: "source it",
        text: "Looking for a scent we don't stock yet? Send a special order and we'll try to bring it in.",
        primaryLabel: "Request a special order",
        primaryLink: "/special-orders",
        green: false,
      },
    ],
    collectionsTitle: "Browse the range",
    collectionsIntro: "Perfumes by brand and scent — add what you like to your bag.",
    scentsTitle: "Shop by scent",
    latestTitle: "Just arrived",
    latestIntro: "The newest additions to our shelves.",
    sourceTitle: "If we don't have it, we'll source it",
    sourceText: "Looking for something that isn't listed? Send us a special order and we'll try to bring it in for you.",
    sourceButton: "Request a special order",
    bestsellersTitle: "Customer favourites",
    bestsellersIntro: "The scents people keep coming back for.",
    stepsTitle: "Ordering takes three steps",
    brandsTitle: "The brands we carry",
    brandsHomeIntro: "Browse by the names you already know.",
    brandsIntro: "Shop by the perfume houses we stock.",
    shopIntro: "Browse our perfumes, add what you like to your bag and order on WhatsApp.",
    specialOrdersIntro: "Tell us what you're looking for and we'll try to source it for you.",
    signupTitle: "Hear about new arrivals first",
    signupText: "Join our WhatsApp updates for new stock and offers.",
    footerBlurb: "Arabian perfumes, ordered on WhatsApp and delivered across Botswana.",
    priceNote: "Prices in Botswana Pula (P).",
  },
});

for (const p of products) {
  const next = titleCase(p.name);
  if (next && next !== p.name) {
    tx.patch(p._id, { set: { name: next } });
    console.log(`${p.name} → ${next}`);
  }
}

tx.patch("category-perfumes", {
  set: {
    blurb: "Long-lasting Arabian and designer-inspired perfumes. 100 ml bottles from P350.",
  },
});

await tx.commit({ visibility: "async" });
console.log(`Patched siteSettings, perfume category, and ${products.length} products.`);
