"use client";

import Link from "next/link";
import { CardIcon, ChatIcon, ReturnsIcon, TruckIcon } from "@/components/Icons";
import { useCatalog } from "@/context/CatalogContext";
import { money, paragraphs } from "@/lib/format";

export default function DeliveryView() {
  const { settings } = useCatalog();

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Delivery &amp; returns</div>
          <h1>Delivery &amp; returns</h1>
        </div>
        <div className="info">
          <div className="icard">
            <h3><TruckIcon />Delivery</h3>
            {paragraphs(settings.deliveryText).map((text) => <p key={text}>{text}</p>)}
            {settings.courierFees.length > 0 && (
              <ul>
                {settings.courierFees.map((c) => <li key={c.town}>{c.town}: {money(c.fee)}</li>)}
              </ul>
            )}
          </div>
          <div className="icard">
            <h3><CardIcon />Payment</h3>
            <ul>
              <li>Cash</li>
              <li>Pay2Cell</li>
              <li>Orange Money</li>
              <li>EFT</li>
            </ul>
            <p style={{ marginTop: 8 }}>We send payment details with your order confirmation.</p>
          </div>
          <div className="icard">
            <h3><ReturnsIcon />Returns</h3>
            {paragraphs(settings.returnsText).map((text) => <p key={text}>{text}</p>)}
          </div>
          <div className="icard">
            <h3><ChatIcon />How ordering works</h3>
            <p>Add products to your bag, enter your name, town and payment method, and send the order on WhatsApp. We reply to confirm stock, the courier fee and payment.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
