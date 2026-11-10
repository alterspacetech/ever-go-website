"use client";

import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";

const preLine = { whiteSpace: "pre-line" };

export default function ContactView() {
  const { settings } = useCatalog();
  const { toast } = useStore();
  const whatsapp = useWhatsApp();

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    whatsapp.open(`Hello EVER-GO, this is ${form.get("name").trim()}.\n\n${form.get("message").trim()}`);
    toast("Opening WhatsApp…");
  }

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Contact</div>
          <h1>Contact us <span className="ar" lang="ar">تواصل معنا</span></h1>
        </div>
        <div className="info">
          <div className="icard">
            <h3>Where to find us</h3>
            {settings.address && <p style={preLine}>{settings.address}</p>}
            {settings.openingHours && <p style={preLine}>{settings.openingHours}</p>}
            <h3 style={{ marginTop: 18 }}>Talk to us</h3>
            <p>WhatsApp: <b>{whatsapp.display}</b></p>
            {settings.phone && <p>Phone: <b>{settings.phone}</b></p>}
            {settings.email && <p>Email: <a href={`mailto:${settings.email}`}><b>{settings.email}</b></a></p>}
            <SocialLinks />
          </div>
          <div className="icard">
            <h3>Send a message</h3>
            <form className="form" onSubmit={submit}>
              <label className="full">Your name<input name="name" autoComplete="name" required /></label>
              <label className="full">Message<textarea name="message" required placeholder="How can we help?" /></label>
              <div className="full"><button className="btn green" type="submit">Send on WhatsApp</button></div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}