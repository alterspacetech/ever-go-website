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

if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2025-10-01", useCdn: false, token });

const polishedDir = path.join(repo, "data/images/polished");
const files = readdirSync(polishedDir).filter((f) => /\.(jpe?g|png)$/i.test(f));

function slugFromFile(name) {
  return name
    .replace(/\.(jpe?g|png)$/i, "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const products = await client.fetch(`*[_type=="product"]{ _id, name, "slug": slug.current }`);
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

const tx = client.transaction();
let matched = 0;

for (const file of files) {
  const slug = slugFromFile(file);
  const product = bySlug[slug];
  if (!product) {
    console.warn("no product for", file, "→", slug);
    continue;
  }
  const asset = await client.assets.upload("image", createReadStream(path.join(polishedDir, file)), {
    filename: file,
    contentType: file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
  });
  tx.patch(product._id, {
    set: {
      photo: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    },
  });
  matched += 1;
  console.log(`${product.name} ← ${file}`);
}

const aboutText = `EVER-GO Fragrance World is a perfume shop in Francistown, Botswana.

You'll find us on Lobengula Avenue, next to John Mackenzie School — near Cut Price, opposite the BTC office and the old Mascom office.

We stock Arabian and designer-inspired fragrances from houses like Lattafa and Armaf. Fill a bag on this site and order on WhatsApp, or visit us in person.`;

tx.patch("siteSettings", {
  set: {
    aboutTitle: "About EVER-GO",
    aboutText,
    address: "Lobengula Avenue, next to John Mackenzie School, Francistown, Botswana\nNear Cut Price, opposite BTC office / old Mascom office",
  },
});

await tx.commit({ visibility: "async" });
console.log(`Updated ${matched} product photos and about text.`);
