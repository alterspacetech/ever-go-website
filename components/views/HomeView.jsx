"use client";

import { useState } from "react";
import Link from "next/link";
import BrandCards from "@/components/BrandCards";
import HeroSlider from "@/components/HeroSlider";
import { BulkIcon, CardIcon, ChatIcon, SearchIcon, TruckIcon } from "@/components/Icons";
import { ProductArt, ProductVisual } from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import ProductRail from "@/components/ProductRail";
import Reveal from "@/components/Reveal";
import { useCatalog } from "@/context/CatalogContext";
import { minPrice } from "@/lib/catalog";
import { money, plural } from "@/lib/format";

const PERK_ICONS = { truck: TruckIcon, card: CardIcon, chat: ChatIcon, bulk: BulkIcon };

const COLLECTION_COLOURS = [
  { background: "#0B6B4B", circle: "rgba(255,255,255,.12)" },
  { background: "#D21F2B", circle: "rgba(255,255,255,.14)" },
  { background: "#141414", circle: "rgba(255,255,255,.1)" },
  { background: "#07432F", circle: "rgba(255,255,255,.1)" },
];

function Heading({ title, intro, children }) {
  if (!title && !children) return null;
  return (
    <div className="sh">
      <div>
        {title && <h2>{title}</h2>}
        {intro && <p>{intro}</p>}
      </div>
      {children}
    </div>
  );
}

function ScentBand() {
  const { settings } = useCatalog();
  if (!settings.scentBand.length) return null;
  const items = [...settings.scentBand, ...settings.scentBand];
  return (
    <div className="band" aria-hidden="true">
      <div className="band-track">
        {[0, 1].map((copy) => (
          <div className="band-set" key={copy}>
            {items.map((word, i) => (
              <span key={i}>
                {word.english} {word.arabic && <i lang="ar">{word.arabic}</i>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* The most common scent notes across the products, so the links follow the catalogue. */
function ScentLinks() {
  const { products, settings } = useCatalog();
  const counts = new Map();
  products.forEach((p) => p.notes.forEach((note) => {
    const key = note.toLowerCase();
    counts.set(key, { label: counts.get(key)?.label || note, n: (counts.get(key)?.n || 0) + 1 });
  }));
  const top = [...counts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6);
  if (!top.length) return null;
  return (
    <div className="scents">
      {settings.scentsTitle && <b>{settings.scentsTitle}</b>}
      {top.map(([key, { label }]) => (
        <Link key={key} href={`/shop?q=${encodeURIComponent(key)}`}>{label[0].toUpperCase() + label.slice(1)}</Link>
      ))}
    </div>
  );
}

function Collections() {
  const { products, visibleGroups, countInGroup, settings } = useCatalog();
  return (
    <Reveal as="section" className="blk">
      <div className="wrap">
        <Heading title={settings.collectionsTitle} intro={settings.collectionsIntro} />
        <div className="colgrid">
          {visibleGroups.slice(0, 4).map((g, i) => (
            <Link className="cg" key={g.id} href={`/shop/${g.id}`} style={{ background: COLLECTION_COLOURS[i].background }}>
              <ProductArt product={products.find((p) => p.group === g.id)} {...COLLECTION_COLOURS[i]} fit="xMidYMax meet" />
              {g.ar && <span className={`big${g.ar.length > 6 ? " long" : ""}`} lang="ar">{g.ar}</span>}
              <span className="lab">
                <b>{g.name}</b>
                <span>{plural(countInGroup(g.id), "product")}</span>
              </span>
            </Link>
          ))}
        </div>
        <ScentLinks />
      </div>
    </Reveal>
  );
}

function Spotlight({ product }) {
  const { getGroup } = useCatalog();
  return (
    <Link className="spot" href={`/products/${product.id}`}>
      <span className="spot-art">
        <ProductVisual product={product} width={900} background="#07432F" circle="rgba(255,255,255,.1)" fit="xMidYMax meet" />
      </span>
      <span className="spot-tx">
        <small>{product.brand || getGroup(product.group).name}</small>
        <b>{product.name}</b>
        {product.scent && <span>{product.scent}</span>}
        <em>{product.variants.length > 1 ? "From " : ""}{money(minPrice(product))}</em>
      </span>
    </Link>
  );
}

function Bestsellers() {
  const { products, visibleGroups, bestsellerProducts, settings } = useCatalog();
  const [tab, setTab] = useState("best");
  const tabs = [{ id: "best", name: "Bestsellers" }, ...visibleGroups];
  const list = tab === "best" ? bestsellerProducts() : products.filter((p) => p.group === tab);

  return (
    <Reveal as="section" className="blk tint">
      <div className="wrap">
        <Heading title={settings.bestsellersTitle} intro={settings.bestsellersIntro}>
          <div className="tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === tab} onClick={() => setTab(t.id)}>{t.name}</button>
            ))}
          </div>
        </Heading>
        {list.length ? (
          <div className="bestgrid">
            <Spotlight product={list[0]} />
            <div className="grid c3">
              {list.slice(1, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : (
          <div className="none">Nothing here yet.</div>
        )}
      </div>
    </Reveal>
  );
}

export default function HomeView() {
  const { brands, latestProducts, settings } = useCatalog();

  return (
    <main>
      <div className="wrap">
        <HeroSlider />
        {settings.perks.length > 0 && (
          <div className="perks">
            {settings.perks.map((perk) => {
              const Icon = PERK_ICONS[perk.icon] || ChatIcon;
              return (
                <div className="perk" key={perk._key || perk.title}>
                  <Icon />
                  <span><b>{perk.title}</b>{perk.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScentBand />

      <Collections />

      <Reveal as="section" className="blk">
        <div className="wrap">
          <Heading title={settings.latestTitle} intro={settings.latestIntro}>
            <Link className="lnk" href="/shop">View all</Link>
          </Heading>
          <ProductRail products={latestProducts()} />
        </div>
      </Reveal>

      {settings.sourceTitle && (
        <Reveal as="section" className="blk">
          <div className="wrap">
            <div className="source">
              <span className="ic"><SearchIcon /></span>
              <div>
                <h3>{settings.sourceTitle}</h3>
                {settings.sourceText && <p>{settings.sourceText}</p>}
              </div>
              {settings.sourceButton && <Link className="btn white" href="/special-orders">{settings.sourceButton}</Link>}
            </div>
          </div>
        </Reveal>
      )}

      <Bestsellers />

      {settings.orderSteps.length > 0 && (
        <Reveal as="section" className="blk">
          <div className="wrap">
            <div className="steps">
              {settings.stepsTitle && <h2>{settings.stepsTitle}</h2>}
              <ol>
                {settings.orderSteps.map((step, i) => (
                  <li key={step._key || step.title}>
                    <span className="n">{i + 1}</span>
                    <b>{step.title}</b>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal as="section" className="blk">
        <div className="wrap">
          <Heading title={settings.brandsTitle} intro={settings.brandsHomeIntro}>
            <Link className="lnk" href="/brands">All brands</Link>
          </Heading>
          <div className="brands row"><BrandCards brands={brands.slice(0, 5)} /></div>
        </div>
      </Reveal>
    </main>
  );
}