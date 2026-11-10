"use client";

import { useCatalog } from "@/context/CatalogContext";
import { money } from "@/lib/format";

export function Quantity({ value, onChange }) {
  return (
    <div className="q">
      <button onClick={() => onChange(value - 1)} aria-label="One less">−</button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="One more">+</button>
    </div>
  );
}

export function Price({ product, variant, qty }) {
  const { unitPrice } = useCatalog();
  const unit = unitPrice(product, variant, qty);
  return (
    <>
      {money(unit)}
      {unit < variant.price && (
        <>
          <s>{money(variant.price)}</s>
          <small>Bulk price</small>
        </>
      )}
    </>
  );
}

export function VariantPicker({ product, selected, onSelect }) {
  if (product.variants.length < 2 && selected.size === "One size") return null;

  return (
    <div>
      <div className="lbl">{product.optionLabel}</div>
      <div className="vars">
        {product.variants.map((v) => (
          <button key={v.size} className={v.inStock ? "" : "off"} onClick={() => onSelect(v.size)} aria-pressed={v.size === selected.size}>
            <b>{v.size}</b>
            <span>{v.inStock ? money(v.price) : "Out of stock"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}