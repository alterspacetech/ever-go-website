/* Loads the product sheet into Sanity.
 *
 *   npm run import            adds what is missing and leaves existing documents alone
 *   npm run import:replace    overwrites documents that came from the sheet
 *   npm run seed:settings     fills new empty fields and never overwrites anything already filled in
 *   npm run sample            writes ../data/sample-dataset.json without contacting Sanity
 */
import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const seed = (name) => new URL(`../seed/${name}`, import.meta.url);
const replaceExisting = process.argv.includes("--replace");
const dryRun = process.argv.includes("--dry");
const settingsOnly = process.argv.includes("--settings");

const SECTIONS = [
  { id: "perfumes", illustration: "perfume", title: "Perfumes", arabicName: "عطور", match: /perfume(?!.*oil)/i, blurb: "Long-lasting Arabian and designer-inspired perfumes. Every 30 ml bottle is P35." },
  { id: "oils", illustration: "attar", title: "Perfume oils", arabicName: "زيوت عطرية", match: /roll|dip|oil|attar/i, blurb: "Alcohol-free roll-ons and dip sticks that sit close to the skin." },
  { id: "bukhoor", illustration: "chips", title: "Bukhoor", arabicName: "بخور", match: /bukhoor|bakhoor|oud chip|incense|burner/i, blurb: "Burners, bukhoor and oud chips to scent the whole home." },
  { id: "beauty", illustration: "jar", title: "Beauty care", arabicName: "عناية", match: /beauty|body|lotion|mist|cream|skin|hair/i, blurb: "Lotions, mists and everyday body care." },
  { id: "more", illustration: "ball", title: "More", arabicName: "المزيد", match: /.*/, blurb: "Sports, gifts and everything else on the shelf." },
];

const BESTSELLERS = ["Khamrah", "Lattafa Asad", "Oud Mood", "White Musk Roll-on"];

const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");
const key = (...parts) => slugify(parts.join("-")).slice(0, 40) || "item";
const ref = (id) => ({ _type: "reference", _ref: id });
const slugField = (value) => ({ _type: "slug", current: value });
const rows = (file) =>
  readFileSync(seed(file), "utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split("\t"));

function parsePrice(value) {
  const n = parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isNaN(n) ? null : n;
}

function parseBulk(text) {
  const out = {};
  String(text || "")
    .split("|")
    .forEach((raw) => {
      let segment = raw.trim();
      if (!segment) return;
      let label = "*";
      const match = segment.match(/^([^:]+):(.*)$/);
      if (match && !/\d+\s*\+/.test(match[1])) {
        label = normalize(match[1]);
        segment = match[2];
      }
      const tiers = [...segment.matchAll(/(\d+)\s*\+\s*=\s*P?\s*([\d.]+)/gi)].map((m) => ({ minQty: +m[1], price: +m[2] }));
      if (tiers.length) out[label] = (out[label] || []).concat(tiers);
    });
  return out;
}

const withKeys = (tiers) => tiers.map((t) => ({ _type: "tier", _key: `t${t.minQty}`, ...t }));

export function buildDocuments() {
  const brands = new Map();
  const products = [];

  rows("products.tsv").forEach((c, index) => {
    const name = (c[0] || "").replace(/^EXAMPLE\s*[–-]\s*/i, "").trim();
    if (!name) return;

    const productType = (c[2] || "").trim();
    const section = SECTIONS.find((s) => s.match.test(productType));
    const bulk = parseBulk(c[14]);
    const inStock = !/^no/i.test((c[15] || "yes").trim());
    const sizes = [];
    for (let i = 0; i < 4; i++) {
      const label = (c[6 + i * 2] || "").trim() || "One size";
      const price = parsePrice(c[7 + i * 2]);
      if (price == null) continue;
      const tiers = bulk[normalize(label)] || bulk["*"];
      sizes.push({
        _type: "sizeOption",
        _key: key("s", i, label),
        label,
        price,
        inStock,
        ...(tiers ? { bulkTiers: withKeys(tiers) } : {}),
      });
    }
    if (!sizes.length) return;

    const brandName = (c[1] || "").trim();
    if (brandName) brands.set(slugify(brandName), brandName);
    const audience = (c[3] || "").trim();
    const scent = (c[4] || "").split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    const notes = c[17] || "";
    const badge = /best/i.test(notes) ? "bestseller" : /new/i.test(notes) ? "new" : undefined;
    const id = slugify(name);

    products.push({
      _id: `product-${id}`,
      _type: "product",
      name,
      slug: slugField(id),
      category: ref(`category-${section.id}`),
      ...(brandName ? { brand: ref(`brand-${slugify(brandName)}`) } : {}),
      productType,
      ...(/^(men|women|unisex)$/i.test(audience) ? { audience: audience[0].toUpperCase() + audience.slice(1).toLowerCase() } : {}),
      ...(/burner/i.test(productType) ? { illustration: "burner" } : {}),
      ...(sizes.some((s) => /gold|black|silver|white|red|blue|green|brown/i.test(s.label)) ? { optionLabel: "Colour" } : {}),
      scentNotes: scent,
      description: (c[5] || "").trim(),
      sizes,
      ...(badge ? { badge } : {}),
      sortOrder: index + 1,
      photoFile: (c[16] || "").trim(),
    });
  });

  const productIdByName = (name) => products.find((p) => p.name.toLowerCase() === name.toLowerCase())?._id;

  const bulkRules = rows("categoryBulk.tsv")
    .filter((c) => c[0] && c[2])
    .map((c) => ({
      _id: `bulk-${slugify(`${c[0]} ${c[1]}`)}`,
      _type: "bulkRule",
      productType: c[0].trim(),
      size: c[1].trim(),
      bulkTiers: withKeys(parseBulk(c[2])["*"] || []),
    }));

  const heroProduct = (name) => {
    const id = productIdByName(name);
    return id ? { product: ref(id) } : {};
  };

  const settings = {
    _id: "siteSettings",
    _type: "siteSettings",
    whatsappNumber: "26770000000",
    whatsappDisplay: "+267 70 000 000",
    promoText: "Any 30 ml perfume",
    promoPrice: "P35",
    heroSlides: [
      {
        _type: "heroSlide", _key: "slide1", eyebrow: "Welcome to EVER-GO", eyebrowArabic: "أهلاً",
        titleBefore: "Perfumes & ", titleAccent: "beauty care", titleAfter: " products",
        text: "Arabian perfumes, perfume oils, bukhoor and body care. Fill your bag and order on WhatsApp.",
        primaryLabel: "Shop all products", primaryLink: "/shop", secondaryLabel: "Shop by brand", secondaryLink: "/brands", green: false,
        ...heroProduct("Khamrah"),
      },
      {
        _type: "heroSlide", _key: "slide2", eyebrow: "One price",
        titleBefore: "Any 30 ml perfume, ", titleAccent: "P35.",
        text: "Choose by how it smells, not by the price. Buying for a shop? Bulk prices apply on their own.",
        primaryLabel: "Shop perfumes", primaryLink: "/shop/perfumes", green: true,
        ...heroProduct("Oud Mood"),
      },
      {
        _type: "heroSlide", _key: "slide3", eyebrow: "For the home",
        titleBefore: "Bukhoor, oud chips & ", titleAccent: "burners",
        text: "Electric and classic burners, oud chips and bukhoor to scent every room.",
        primaryLabel: "Shop bukhoor", primaryLink: "/shop/bukhoor", green: false,
      },
    ],
    bestsellers: BESTSELLERS.map(productIdByName).filter(Boolean).map((id) => ({ ...ref(id), _key: id })),
    deliveryText: "We deliver countrywide with Sprint Courier.\n\nThe courier fee depends on your town. We confirm it on WhatsApp before we send your order.",
    returnsText: "If something arrives damaged or isn't what you ordered, message us on WhatsApp with a photo and your order details.",
    courierFees: [],
    courierName: "Sprint Courier",
    deliveryLine: "Delivered countrywide by Sprint Courier",
    paymentMethods: ["Cash", "Pay2Cell", "Orange Money", "EFT"],
    paymentNote: "We send payment details with your order confirmation.",
    howOrderingText: "Add products to your bag, enter your name, town and payment method, then send the order on WhatsApp. We'll reply to confirm stock, the courier fee and payment.",
    perks: [
      { _type: "perk", _key: "p1", icon: "truck", title: "Countrywide delivery", text: "Sent by Sprint Courier" },
      { _type: "perk", _key: "p2", icon: "card", title: "Easy payment", text: "Cash, Pay2Cell, Orange Money or EFT" },
      { _type: "perk", _key: "p3", icon: "chat", title: "Order on WhatsApp", text: "No account needed" },
      { _type: "perk", _key: "p4", icon: "bulk", title: "Bulk prices", text: "Applied automatically in your bag" },
    ],
    scentBand: [["Oud", "عود"], ["Rose", "ورد"], ["Musk", "مسك"], ["Amber", "عنبر"], ["Saffron", "زعفران"], ["Jasmine", "ياسمين"], ["Sandalwood", "صندل"]].map(([english, arabic]) => ({ _type: "scentWord", _key: english.toLowerCase(), english, arabic })),
    collectionsTitle: "Start with what you love",
    collectionsIntro: "Perfumes to wear, oils to layer, bukhoor for the home and care for your skin.",
    scentsTitle: "Shop by scent",
    latestTitle: "Just arrived",
    latestIntro: "The newest additions to our shelves.",
    sourceTitle: "If we don't have it, we'll source it",
    sourceText: "Looking for something that isn't listed? Send us a special order and we'll try to bring it in for you.",
    sourceButton: "Request a special order",
    bestsellersTitle: "Customer favourites",
    bestsellersIntro: "The scents people keep coming back for.",
    stepsTitle: "Ordering takes three steps",
    orderSteps: [
      { _type: "orderStep", _key: "s1", title: "Fill your bag", text: "Choose what you like. Bulk prices apply automatically." },
      { _type: "orderStep", _key: "s2", title: "Add your details", text: "Enter your name, town and how you'd like to pay." },
      { _type: "orderStep", _key: "s3", title: "Send it on WhatsApp", text: "Your order is written out for you. Press send and we'll confirm it." },
    ],
    brandsTitle: "The brands we carry",
    brandsHomeIntro: "Browse by the names you already know.",
    brandsIntro: "Every brand we stock. Choose one to see its products.",
    shopIntro: "Browse our full range, add what you like to your bag and order on WhatsApp.",
    specialOrdersIntro: "Can't find what you're looking for? Tell us the product and we'll try to source it. We'll reply on WhatsApp with the price and timing.",
    signupTitle: "Hear about new arrivals first",
    signupText: "Join our WhatsApp updates for new stock and offers.",
    footerBlurb: "Perfumes and beauty care, delivered across Botswana.",
    priceNote: "All prices in Botswana pula",
  };

  const categories = SECTIONS.map((s, i) => ({
    _id: `category-${s.id}`,
    _type: "category",
    title: s.title,
    slug: slugField(s.id),
    arabicName: s.arabicName,
    blurb: s.blurb,
    illustration: s.illustration,
    sortOrder: i + 1,
  }));

  const brandDocs = [...brands].map(([id, name]) => ({ _id: `brand-${id}`, _type: "brand", name, slug: slugField(id) }));

  return [...categories, ...brandDocs, ...bulkRules, ...products, settings];
}

async function uploadPhoto(client, fileName) {
  const path = seed(`img/${fileName}`);
  if (!fileName || !existsSync(path)) return undefined;
  const asset = await client.assets.upload("image", createReadStream(path), { filename: fileName });
  return { _type: "image", asset: ref(asset._id) };
}

function writeClient() {
  const { SANITY_STUDIO_PROJECT_ID: projectId, SANITY_STUDIO_DATASET: dataset = "production", SANITY_WRITE_TOKEN: token } = process.env;
  if (!projectId || !token) throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_WRITE_TOKEN in studio/.env first.");
  return createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
}

async function seedSettings(documents) {
  const client = writeClient();
  const transaction = client.transaction();
  for (const { photoFile, ...doc } of documents) {
    const { _id, _type, ...fields } = doc;
    if (_type === "bulkRule" || _type === "brand") continue;
    const missing = _type === "siteSettings" ? fields : Object.fromEntries(["illustration", "optionLabel"].filter((k) => fields[k]).map((k) => [k, fields[k]]));
    transaction.createIfNotExists(doc);
    if (Object.keys(missing).length) transaction.patch(_id, { setIfMissing: missing });
  }
  await transaction.commit();
  console.log("Done: new fields filled in. Nothing you had already written was changed.");
}

async function run() {
  const documents = buildDocuments();

  if (dryRun) {
    const createdAt = "2026-01-01T00:00:00Z";
    const sample = documents.map(({ photoFile, ...doc }) => ({ ...doc, _createdAt: createdAt }));
    writeFileSync(new URL("../../data/sample-dataset.json", import.meta.url), `${JSON.stringify(sample, null, 2)}\n`);
    console.log(`Wrote ${sample.length} sample documents.`);
    return;
  }

  if (settingsOnly) return seedSettings(documents);

  const { SANITY_STUDIO_PROJECT_ID: projectId, SANITY_STUDIO_DATASET: dataset = "production", SANITY_WRITE_TOKEN: token } = process.env;
  if (!projectId || !token) {
    throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_WRITE_TOKEN in studio/.env first.");
  }

  const client = createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
  const transaction = client.transaction();
  let photos = 0;

  for (const { photoFile, ...doc } of documents) {
    const photo = doc._type === "product" ? await uploadPhoto(client, photoFile) : undefined;
    if (photo) photos += 1;
    const finalDoc = photo ? { ...doc, photo } : doc;
    if (replaceExisting) transaction.createOrReplace(finalDoc);
    else transaction.createIfNotExists(finalDoc);
  }

  await transaction.commit();
  console.log(`Done: ${documents.length} documents and ${photos} photos sent to ${projectId}/${dataset}.`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
