"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { money, plural } from "@/lib/format";
import { bagOrderText, makeOrderRef } from "@/lib/whatsappMessages";
import { WhatsAppIcon } from "./Icons";
import { ProductVisual } from "./ProductArt";
import { Quantity } from "./ProductControls";

const OTHER_TOWN = "__other";
const NUDGE_DISTANCE = 3;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    area.remove();
    return copied;
  }
}

function BagLine({ line }) {
  const { tiersFor } = useCatalog();
  const { setQty } = useStore();
  const { key, product, variant, qty, unit, base } = line;
  const nextTier = tiersFor(product, variant.size).find((t) => t.min > qty);
  const needed = nextTier ? nextTier.min - qty : 0;

  return (
    <div className="it">
      <div className="th"><ProductVisual product={product} width={160} /></div>
      <div>
        <b>{product.name}</b>
        <small>
          {variant.size !== "One size" && `${variant.size} · `}
          {unit < base ? (
            <>
              <s>{money(base)}</s> <span className="deal">{money(unit)} bulk</span>
            </>
          ) : (
            money(unit)
          )}
        </small>
        <button className="rm" onClick={() => setQty(key, 0)}>Remove</button>
      </div>
      <Quantity value={qty} onChange={(q) => setQty(key, q)} />
      {nextTier && needed <= NUDGE_DISTANCE && (
        <button className="nudge" onClick={() => setQty(key, nextTier.min)}>
          Add {needed} more and pay {money(nextTier.price)} each
        </button>
      )}
    </div>
  );
}

export default function BagDrawer() {
  const { settings } = useCatalog();
  const { bag, lines, itemCount, total, bagOpen, closeBag, toast } = useStore();
  const whatsapp = useWhatsApp();
  const [details, setDetails] = useState({ name: "", town: "", otherTown: "", pay: settings.paymentMethods[0] || "", note: "" });
  const closeRef = useRef(null);
  const orderRef = useMemo(() => makeOrderRef(), [bag]); // A changed bag counts as a new order.

  useEffect(() => {
    if (!bagOpen) return undefined;
    const timer = setTimeout(() => closeRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [bagOpen]);

  const update = (field) => (e) => setDetails((d) => ({ ...d, [field]: e.target.value }));
  const hasTownList = settings.courierFees.length > 0;
  const choosingOther = details.town === OTHER_TOWN;
  const townName = choosingOther ? details.otherTown : details.town;
  const courierFee = settings.courierFees.find((c) => c.town === details.town)?.fee ?? null;
  const grandTotal = total + (courierFee ?? 0);
  const hasItems = lines.length > 0;
  const orderText = hasItems
    ? bagOrderText({ ref: orderRef, lines, itemsTotal: total, courierFee, details: { ...details, town: townName }, courierName: settings.courierName })
    : "";
  const canSend = hasItems && details.name.trim().length > 0;

  let hint = "Add a product and your name first.";
  if (canSend) hint = "WhatsApp opens with this message. Just press send.";
  else if (hasItems) hint = "Add your name to continue.";

  async function copyOrder() {
    if (!hasItems) {
      toast("Your bag is empty");
      return;
    }
    toast((await copyText(orderText)) ? "Order copied" : "Select the text to copy it");
  }

  return (
    <aside className={`drawer${bagOpen ? " open" : ""}`} aria-label="Bag" aria-hidden={!bagOpen} inert={!bagOpen}>
      <div className="dh">
        <h2>My bag<span>{itemCount ? `(${itemCount})` : ""}</span></h2>
        <button className="x" ref={closeRef} onClick={closeBag} aria-label="Close bag">×</button>
      </div>

      <div className="dscroll">
        {hasItems ? (
          lines.map((line) => <BagLine key={line.key} line={line} />)
        ) : (
          <div className="empty">
            <span className="ar" lang="ar">أهلاً</span>
            Your bag is empty.
            <br />
            <br />
            <Link className="btn line" href="/shop" onClick={closeBag}>Start shopping</Link>
          </div>
        )}

        {hasItems && (
          <>
            <div className="bform">
              <label>
                Your name
                <input autoComplete="name" placeholder="Name" value={details.name} onChange={update("name")} />
              </label>
              <label>
                Town
                {hasTownList ? (
                  <select value={details.town} onChange={update("town")}>
                    <option value="">Choose town</option>
                    {settings.courierFees.map((c) => (
                      <option key={c.town} value={c.town}>{c.town} ({money(c.fee)})</option>
                    ))}
                    <option value={OTHER_TOWN}>My town isn't listed</option>
                  </select>
                ) : (
                  <input placeholder="Your town" value={details.town} onChange={update("town")} />
                )}
              </label>
              {choosingOther && (
                <label className="full">
                  Your town
                  <input placeholder="Your town" value={details.otherTown} onChange={update("otherTown")} />
                </label>
              )}
              <div className="full lb">
                Payment
                <div className="pay">
                  {settings.paymentMethods.map((method) => (
                    <label key={method}>
                      <input type="radio" name="pay" value={method} checked={details.pay === method} onChange={update("pay")} />
                      {method}
                    </label>
                  ))}
                </div>
              </div>
              <label className="full">
                Note (optional)
                <textarea rows="1" placeholder="Anything we should know" value={details.note} onChange={update("note")} />
              </label>
            </div>
            <div className="wa">
              <div className="wh">Your WhatsApp message</div>
              <div className="bubble">{orderText}</div>
            </div>
          </>
        )}
      </div>

      <div className="df">
        <div className="sum">
          <span>{plural(itemCount, "item")} · {courierFee != null ? `courier ${money(courierFee)}` : "plus courier"}</span>
          <b>{money(grandTotal)}</b>
        </div>
        <a
          className="send"
          href={canSend ? whatsapp.link(orderText) : "#"}
          target="_blank"
          rel="noopener"
          aria-disabled={!canSend}
          onClick={(e) => {
            if (!canSend) e.preventDefault();
          }}
        >
          <WhatsAppIcon />
          Order on WhatsApp
        </a>
        <div className="hint">
          <span>{hint}</span> <button onClick={copyOrder}>Copy order</button>
        </div>
      </div>
    </aside>
  );
}