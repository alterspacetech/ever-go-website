"use client";

import { useState } from "react";
import Link from "next/link";
import { CompareIcon, HeartFilledIcon, HeartIcon, WhatsAppIcon } from "@/components/Icons";
import { ProductVisual } from "@/components/ProductArt";
import ProductRail from "@/components/ProductRail";
import { Price, Quantity, VariantPicker } from "@/components/ProductControls";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { firstAvailable, typeLine } from "@/lib/catalog";
import { money, paragraphs } from "@/lib/format";
import { buyNowText, makeOrderRef, notifyText } from "@/lib/whatsappMessages";

function ProductTabs({ product, group }) {
  const { settings } = useCatalog();
  const [tab, setTab] = useState("desc");
  const tabs = [
    ["desc", "Description"],
    ...(product.notes.length ? [["notes", "Scent notes"]] : []),
    ["info", "Details"],
    ["ship", "Delivery & returns"],
  ];
  const detailRows = [
    ["Brand", product.brand || "-"],
    ["Category", product.category || group.name],
    ["For", product.for || "-"],
    ["Options", product.variants.map((v) => `${v.size} (${money(v.price)})${v.inStock ? "" : ", out of stock"}`).join(", ")],
    ["Availability", product.inStock ? "In stock" : "Out of stock"],
  ];

  return (
    <div className="ptabs">
      <div className="tl" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={id === tab} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="tp">
        {tab === "desc" && <p>{product.desc || "Ask us on WhatsApp for more details about this product."}</p>}
        {tab === "notes" && <div className="notes">{product.notes.map((note) => <span key={note}>{note}</span>)}</div>}
        {tab === "info" && (
          <table>
            <tbody>
              {detailRows.map(([label, value]) => (
                <tr key={label}><td>{label}</td><td>{value}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "ship" && (
          <>
            {paragraphs(settings.deliveryText).map((text) => <p key={text}>{text}</p>)}
            <p>
              {settings.paymentMethods.length > 0 && `We accept ${settings.paymentMethods.join(", ")}. `}
              <Link href="/delivery">Read our delivery &amp; returns information</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductView({ id }) {
  const { byId, getGroup, tiersFor, unitPrice, relatedProducts } = useCatalog();
  const { wish, compare, toggleWish, toggleCompare, addToBag } = useStore();
  const whatsapp = useWhatsApp();
  const product = byId[id];
  const [size, setSize] = useState(firstAvailable(product).size);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.size === size);
  const tiers = tiersFor(product, variant.size);
  const unit = unitPrice(product, variant, qty);
  const wished = wish.includes(product.id);
  const compared = compare.includes(product.id);
  const group = getGroup(product.group);
  const type = typeLine(product, group);

  function add() {
    addToBag(product.id, size, qty);
    setQty(1);
  }

  function buyNow() {
    whatsapp.open(buyNowText({ ref: makeOrderRef(), product, variant, qty, unit }));
  }

  return (
    <main>
      <div className="wrap">
        <div className="phead" style={{ paddingBottom: 10 }}>
          <div className="crumb">
            <Link href="/">Home</Link> / <Link href={`/shop/${product.group}`}>{group.name}</Link> / {product.name}
          </div>
        </div>

        <div className="pv">
          <div className="vis"><ProductVisual product={product} width={1200} /></div>
          <div className="pinfo">
            {product.brand && <div className="made">Made by <Link href={`/brands/${product.brandId}`}>{product.brand}</Link></div>}
            <h1>{product.name}</h1>
            <div className="made">
              {type}
              {product.for && ` · For ${product.for.toLowerCase()}`}
              {product.category && product.category !== type && ` · ${product.category}`}
            </div>
            <div className="price"><Price product={product} variant={variant} qty={qty} /></div>
            <div className={`stock${variant.inStock ? "" : " no"}`}>{variant.inStock ? "In stock" : "Out of stock"}</div>
            {product.desc && <p className="desc">{product.desc}</p>}
            <VariantPicker product={product} selected={variant} onSelect={setSize} />
            {tiers.length > 0 && (
              <div className="tiers">
                <b>Buy more, pay less ({variant.size})</b>
                <ul>{tiers.map((t) => <li key={t.min}>{t.min}+ · {money(t.price)} each</li>)}</ul>
              </div>
            )}
            {variant.inStock ? (
              <>
                <div className="buy">
                  <Quantity value={qty} onChange={(q) => setQty(Math.max(1, q))} />
                  <button className="btn red" onClick={add}>Add to bag · {money(unit * qty)}</button>
                </div>
                <button className="btn green buynow" onClick={buyNow}><WhatsAppIcon />Buy now on WhatsApp</button>
              </>
            ) : (
              <a className="btn green" href={whatsapp.link(notifyText(product, variant))} target="_blank" rel="noopener">
                Notify me on WhatsApp when it's back
              </a>
            )}
            <div className="iconrow">
              <button onClick={() => toggleWish(product.id)} aria-pressed={wished}>
                {wished ? <HeartFilledIcon /> : <HeartIcon />}
                {wished ? "In wishlist" : "Add to wishlist"}
              </button>
              <button onClick={() => toggleCompare(product.id)} aria-pressed={compared}>
                <CompareIcon />
                {compared ? "In compare" : "Compare"}
              </button>
              <a href={whatsapp.link(`Hello EVER-GO, I have a question about ${product.name}.`)} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3.5 20.5l1.3-3.9A8.5 8.5 0 1 1 8 19.6Z" /></svg>
                Ask a question
              </a>
            </div>
          </div>
        </div>

        <ProductTabs product={product} group={group} />

        <section className="blk">
          <div className="sh"><h2>You may also like</h2></div>
          <ProductRail products={relatedProducts(product)} />
        </section>
      </div>
    </main>
  );
}