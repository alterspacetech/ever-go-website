import { createReadStream, readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(root, "../..");
const env = readFileSync(path.join(root, "../.env"), "utf8");
const token = env.match(/SANITY_WRITE_TOKEN=(.*)/)?.[1]?.trim();
const projectId = env.match(/SANITY_STUDIO_PROJECT_ID=(.*)/)?.[1]?.trim() || "sk91mcdf";
const dataset = env.match(/SANITY_STUDIO_DATASET=(.*)/)?.[1]?.trim() || "production";

const client = createClient({ projectId, dataset, apiVersion: "2025-10-01", useCdn: false, token });

async function uploadImage(filePath, filename) {
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename,
    contentType: "image/jpeg",
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

const lifestyleDir = path.join(repo, "public/images/lifestyle");
const storeDir = path.join(repo, "public/images/store");
const lifestyleFiles = existsSync(lifestyleDir)
  ? readdirSync(lifestyleDir).filter((f) => f.endsWith(".jpg")).sort()
  : [];
const storeFiles = existsSync(storeDir)
  ? readdirSync(storeDir).filter((f) => f.endsWith(".jpg")).sort()
  : [];

console.log("Uploading lifestyle…");
const lifestyle = [];
for (const file of lifestyleFiles.slice(0, 6)) {
  const img = await uploadImage(path.join(lifestyleDir, file), file);
  lifestyle.push(img);
  console.log("  ", file);
}

console.log("Uploading store…");
const store = [];
for (const file of storeFiles.slice(0, 8)) {
  const img = await uploadImage(path.join(storeDir, file), file);
  store.push(img);
  console.log("  ", file);
}

const settings = await client.fetch(`*[_id == "siteSettings"][0]{ heroSlides }`);
const slides = (settings?.heroSlides || []).map((slide, i) => {
  const next = { ...slide };
  if (lifestyle[i]) next.image = lifestyle[i];
  // Prefer real product photography over SVG fallbacks.
  delete next.product;
  return next;
});

// Slide 1, 2, 3 get lifestyle 1–3 if present.
await client
  .patch("siteSettings")
  .set({
    instagram: "https://www.instagram.com/arabic.perfumes.botswana/",
    tiktok: "https://www.tiktok.com/@ever.go4",
    address: "Next to John Mackenzie School, Lobengula Avenue, Francistown, Botswana",
    heroSlides: slides,
    footerImage: store[0] || lifestyle[0] || undefined,
  })
  .commit({ visibility: "async" });

console.log("Updated siteSettings with socials, address, hero images, footer image.");
console.log(JSON.stringify({ lifestyle: lifestyle.length, store: store.length, slides: slides.length }, null, 2));
