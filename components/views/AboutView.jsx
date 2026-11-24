"use client";

import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import StoreGallery from "@/components/StoreGallery";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { paragraphs } from "@/lib/format";
import { STORE_IMAGES } from "@/lib/storeImages";

const preLine = { whiteSpace: "pre-line" };

export default function AboutView() {
  const { settings } = useCatalog();
  const whatsapp = useWhatsApp();
  const title = settings.aboutTitle || "About EVER-GO";
  const body = settings.aboutText || "";

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / About</div>
          <h1>{title}</h1>
        </div>

        <div className="about-split">
          <div className="about-copy">
            {paragraphs(body).map((text) => <p key={text}>{text}</p>)}
            {settings.address && (
              <div className="about-meta">
                <h3>Visit us</h3>
                <p style={preLine}>{settings.address}</p>
              </div>
            )}
            <div className="about-meta">
              <h3>Talk to us</h3>
              <p>WhatsApp: <b>{whatsapp.display}</b></p>
              <SocialLinks />
            </div>
            <div className="about-ctas">
              <Link className="btn red" href="/shop">Shop perfumes</Link>
              <Link className="btn line" href="/contact">Contact</Link>
            </div>
          </div>
          <div className="about-photos">
            {STORE_IMAGES.slice(0, 4).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        </div>
      </div>

      <StoreGallery title="Inside Fragrance World" intro="Photos from our Francistown shop on Lobengula Avenue." limit={8} />
    </main>
  );
}
