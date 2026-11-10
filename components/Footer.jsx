"use client";

import Link from "next/link";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { WhatsAppIcon } from "./Icons";
import Logo from "./Logo";
import { RemoteImage } from "./ProductArt";
import SignupForm from "./SignupForm";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const { visibleGroups, settings } = useCatalog();
  const whatsapp = useWhatsApp();
  const image = settings.footerImage;

  return (
    <footer>
      <div className="wrap">
        <div className={`signup promo fpanel${image ? " has-img" : ""}`} id="signup">
          <div>
            {settings.signupTitle && <h2>{settings.signupTitle}</h2>}
            {settings.signupText && <p>{settings.signupText}</p>}
          </div>
          <SignupForm />
          {image && <div className="fp-img"><RemoteImage src={image} alt="" width={800} /></div>}
        </div>

        <div className="cols">
          <div className="fbrand">
            <Logo />
            {settings.footerBlurb && <p>{settings.footerBlurb}</p>}
            {settings.paymentMethods.length > 0 && (
              <div className="pay">
                {settings.paymentMethods.map((method) => <span key={method}>{method}</span>)}
              </div>
            )}
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/shop">All products</Link></li>
              {visibleGroups.map((g) => (
                <li key={g.id}><Link href={`/shop/${g.id}`}>{g.name}</Link></li>
              ))}
              <li><Link href="/brands">Brands</Link></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><Link href="/special-orders">Special orders</Link></li>
              <li><Link href="/delivery">Delivery &amp; returns</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/compare">Compare</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Talk to us</h4>
            <a className="btn fwa" href={whatsapp.link("Hello EVER-GO, I have a question.")} target="_blank" rel="noopener">
              <WhatsAppIcon />
              {whatsapp.display}
            </a>
            {settings.address && <p className="fnote">{settings.address}</p>}
            <SocialLinks />
          </div>
        </div>

        <div className="base">
          <span>© {new Date().getFullYear()} EVER-GO Fragrance World</span>
          {settings.priceNote && <span>{settings.priceNote}</span>}
          <a href="https://alterspace.tech" target="_blank" rel="noopener">Built by <b>AlterSpace</b></a>
        </div>
      </div>
    </footer>
  );
}