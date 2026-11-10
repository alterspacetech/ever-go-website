"use client";

import Link from "next/link";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";

export default function SpecialOrdersView() {
  const { settings } = useCatalog();
  const { toast } = useStore();
  const whatsapp = useWhatsApp();

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const v = (name) => form.get(name).trim();
    whatsapp.open(
      `Hello EVER-GO, I'd like to make a special order:\n\nProduct: ${v("product")}${v("brand") ? `\nBrand: ${v("brand")}` : ""}${v("size") ? `\nSize: ${v("size")}` : ""}\nQuantity: ${v("qty") || 1}${v("note") ? `\nNotes: ${v("note")}` : ""}\n\nName: ${v("name")}${v("town") ? `\nTown: ${v("town")}` : ""}`
    );
    toast("Opening WhatsApp…");
  }

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Special orders</div>
          <h1>Special orders <span className="ar" lang="ar">طلب خاص</span></h1>
          {settings.specialOrdersIntro && <p>{settings.specialOrdersIntro}</p>}
        </div>
        <div className="signup" style={{ gridTemplateColumns: "1fr" }}>
          <form className="form" onSubmit={submit}>
            <label>Your name<input name="name" autoComplete="name" required /></label>
            <label>Town<input name="town" placeholder="Your town" /></label>
            <label>Product name<input name="product" placeholder="The product you're looking for" required /></label>
            <label>Brand (if you know it)<input name="brand" /></label>
            <label>Size<input name="size" placeholder="The size you need" /></label>
            <label>Quantity<input name="qty" type="number" min="1" defaultValue="1" /></label>
            <label className="full">Anything else<textarea name="note" placeholder="A photo link, a colour, when you need it…" /></label>
            <div className="full" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn red" type="submit">Send request on WhatsApp</button>
              <span className="note">Opens WhatsApp with your request written out.</span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}