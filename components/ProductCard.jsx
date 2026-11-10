"use client";

import Link from "next/link";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { minPrice, productFlag, typeLine } from "@/lib/catalog";
import { money } from "@/lib/format";
import { notifyText } from "@/lib/whatsappMessages";
import { CompareIcon, EyeIcon, HeartFilledIcon, HeartIcon } from "./Icons";
import { ProductVisual } from "./ProductArt";

function AddAction({ product, inBag }) {
  const { addToBag } = useStore();
  const whatsapp = useWhatsApp();

  if (!product.inStock) {
    return (
      <a className="add ask" href={whatsapp.link(notifyText(product))} target="_blank" rel="noopener">
        Notify me
      </a>
    );
  }
  if (product.variants.length > 1) {
    return (
      <Link className={`add${inBag ? " in" : ""}`} href={`/products/${product.id}`}>
        {inBag ? `In bag · ${inBag}` : "Options"}
      </Link>
    );
  }
  return (
    <button className={`add${inBag ? " in" : ""}`} onClick={() => addToBag(product.id, product.variants[0].size)}>
      {inBag ? `✓ ${inBag}` : "Add to bag"}
    </button>
  );
}

export default function ProductCard({ product }) {
  const { getGroup, tiersFor } = useCatalog();
  const { bag, wish, compare, toggleWish, toggleCompare, openQuickView } = useStore();
  const flag = productFlag(product);
  const group = getGroup(product.group);
  const inBag = product.variants.reduce((sum, v) => sum + (bag[`${product.id}|${v.size}`] || 0), 0);
  const wished = wish.includes(product.id);
  const compared = compare.includes(product.id);
  const hasBulk = product.variants.some((v) => tiersFor(product, v.size).length);

  return (
    <article className="pc">
      <div className="tile">
        <Link href={`/products/${product.id}`} aria-label={product.name}>
          <ProductVisual product={product} />
        </Link>
        {flag && <span className={`flag ${flag[1]}`}>{flag[0]}</span>}
        <div className="acts">
          <button onClick={() => toggleWish(product.id)} aria-pressed={wished} aria-label={`${wished ? "Remove from" : "Add to"} wishlist`}>
            {wished ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
          <button className="hov" onClick={() => openQuickView(product.id)} aria-label="Quick view">
            <EyeIcon />
          </button>
          <button className="hov cmp" onClick={() => toggleCompare(product.id)} aria-pressed={compared} aria-label={`${compared ? "Remove from" : "Add to"} compare`}>
            <CompareIcon />
          </button>
        </div>
      </div>
      <div className="bd">
        {product.brand ? (
          <Link className="brand" href={`/brands/${product.brandId}`}>{product.brand}</Link>
        ) : (
          <span className="brand">{group.name}</span>
        )}
        <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3>
        <span className="sc">{product.scent || typeLine(product, group)}</span>
        {hasBulk && <span className="bulk">Bulk prices available</span>}
        <div className="ft">
          <span className="pr">
            {product.variants.length > 1 && <small>From</small>}
            {money(minPrice(product))}
          </span>
          <AddAction product={product} inBag={inBag} />
        </div>
      </div>
    </article>
  );
}
