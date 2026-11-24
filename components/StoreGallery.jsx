"use client";

import { STORE_IMAGES } from "@/lib/storeImages";

export default function StoreGallery({
  title = "Inside the shop",
  intro = "Real shelves from EVER-GO Fragrance World in Francistown.",
  images = STORE_IMAGES,
  limit = 8,
}) {
  const list = images.slice(0, limit);
  if (!list.length) return null;

  return (
    <section className="blk store-gal">
      <div className="wrap">
        <div className="sh">
          <div>
            <h2>{title}</h2>
            {intro && <p>{intro}</p>}
          </div>
        </div>
        <div className="store-grid">
          {list.map((src, i) => (
            <figure key={src} className={i === 0 ? "wide" : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
