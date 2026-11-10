"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { firstAvailable } from "@/lib/catalog";
import { money } from "@/lib/format";
import { notifyText } from "@/lib/whatsappMessages";
import { ProductVisual } from "./ProductArt";
import { Price, Quantity, VariantPicker } from "./ProductControls";

export default function QuickView({ productId }) {
  const { byId, unitPrice } = useCatalog();
  const { addToBag, closeQuickView } = useStore();
  const whatsapp = useWhatsApp();
  const product = byId[productId];
  const [size, setSize] = useState(firstAvailable(product).size);
  const [qty, setQty] = useState(1);
  const closeRef = useRef(null);
  const variant = product.variants.find((v) => v.size === size);

  useEffect(() => closeRef.current?.focus(), []);

  function add() {
    addToBag(product.id, size, qty);
    closeQuickView();
  }

  return (
    <div className="qv">
      <div className="box" role="dialog" aria-modal="true" aria-labelledby="qvTitle">
        <button className="x" ref={closeRef} onClick={closeQuickView} aria-label="Close">×</button>
        <div className="vis"><ProductVisual product={product} width={900} /></div>
        <div className="pinfo">
          {product.brand && (
            <div className="made">
              Made by <Link href={`/brands/${product.brandId}`} onClick={closeQuickView}>{product.brand}</Link>
            </div>
          )}
          <h1 id="qvTitle" style={{ fontSize: 30 }}>{product.name}</h1>
          <div className="price" style={{ fontSize: 24 }}><Price product={product} variant={variant} qty={qty} /></div>
          {product.desc && <p className="desc">{product.desc}</p>}
          <VariantPicker product={product} selected={variant} onSelect={setSize} />
          {variant.inStock ? (
            <div className="buy">
              <Quantity value={qty} onChange={(q) => setQty(Math.max(1, q))} />
              <button className="btn red" onClick={add}>Add to bag · {money(unitPrice(product, variant, qty) * qty)}</button>
            </div>
          ) : (
            <a className="btn green" href={whatsapp.link(notifyText(product, variant))} target="_blank" rel="noopener">
              Notify me on WhatsApp
            </a>
          )}
          <Link className="lnk" href={`/products/${product.id}`} onClick={closeQuickView}>View full details</Link>
        </div>
      </div>
    </div>
  );
}
