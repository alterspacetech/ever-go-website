"use client";

import { useCatalog } from "@/context/CatalogContext";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./Icons";

export default function SocialLinks() {
  const { settings } = useCatalog();
  const links = [
    ["Facebook", settings.facebook, FacebookIcon],
    ["Instagram", settings.instagram, InstagramIcon],
    ["TikTok", settings.tiktok, TikTokIcon],
  ].filter(([, url]) => url);

  if (!links.length) return null;
  return (
    <div className="social">
      {links.map(([name, url, Icon]) => (
        <a key={name} href={url} target="_blank" rel="noopener" aria-label={name}>
          <Icon />
        </a>
      ))}
    </div>
  );
}