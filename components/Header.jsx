"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCatalog, useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { minPrice } from "@/lib/catalog";
import { money, plural } from "@/lib/format";
import { BagIcon, CompareIcon, HeartIcon, MenuIcon } from "./Icons";
import Logo from "./Logo";
import { ProductVisual } from "./ProductArt";
import SearchForm from "./SearchForm";

function UtilityBar() {
  const { settings } = useCatalog();
  const whatsapp = useWhatsApp();
  return (
    <div className="util">
      <div className="wrap">
        <div className="l">
          <span>WhatsApp orders: <b>{whatsapp.display}</b></span>
          {settings.deliveryLine && <span>{settings.deliveryLine}</span>}
        </div>
        <div className="r">
          <Link href="/special-orders">Special orders</Link>
          <Link href="/delivery">Delivery &amp; returns</Link>
          <Link href="/contact">Contact</Link>
          <a href="#signup">Specials sign-up</a>
        </div>
      </div>
    </div>
  );
}

function CategoryLinks() {
  const { products, brands, visibleGroups, countInGroup } = useCatalog();
  return {
    all: <Link href="/shop">All products<span>{products.length}</span></Link>,
    groups: visibleGroups.map((g) => (
      <Link key={g.id} href={`/shop/${g.id}`}>{g.name}<span>{countInGroup(g.id)}</span></Link>
    )),
    brands: brands.map((b) => (
      <Link key={b.id} href={`/brands/${b.id}`}>{b.name}<span>{b.n}</span></Link>
    )),
  };
}

function MobileNav({ open }) {
  const links = CategoryLinks();
  const { products } = useCatalog();
  return (
    <nav className={`mnav${open ? " open" : ""}`} id="mnav" aria-label="Menu">
      <Link href="/">Home</Link>
      <Link href="/shop">Shop all<span>{products.length}</span></Link>
      {links.groups}
      <h4>Brands</h4>
      {links.brands}
      <h4>Help</h4>
      <Link href="/wishlist">Wishlist</Link>
      <Link href="/compare">Compare</Link>
      <Link href="/special-orders">Special orders</Link>
      <Link href="/delivery">Delivery &amp; returns</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}

function MegaMenu() {
  const links = CategoryLinks();
  return (
    <div className="mega" id="mega">
      <div>
        <h4>Categories</h4>
        {links.all}
        {links.groups}
      </div>
      <div>
        <h4>Shop by brand</h4>
        {links.brands.length ? links.brands : <Link href="/brands">All brands</Link>}
        <h4 style={{ marginTop: 16 }}>Help</h4>
        <Link href="/special-orders">Special orders</Link>
        <Link href="/delivery">Delivery &amp; returns</Link>
      </div>
    </div>
  );
}

function NavPanel({ group }) {
  const { products } = useCatalog();
  const list = products.filter((p) => p.group === group.id && p.inStock).slice(0, 4);
  return (
    <div className="navpanel">
      <div className="wrap">
        <div className="np-intro">
          <b>{group.name}</b>
          {group.blurb && <p>{group.blurb}</p>}
          <Link className="lnk" href={`/shop/${group.id}`}>View all</Link>
        </div>
        <div className="np-items">
          {list.map((p) => (
            <Link key={p.id} className="np-item" href={`/products/${p.id}`}>
              <span className="np-th"><ProductVisual product={p} width={240} /></span>
              <b>{p.name}</b>
              <span>{p.variants.length > 1 ? "From " : ""}{money(minPrice(p))}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryBar() {
  const { visibleGroups, settings, getGroup } = useCatalog();
  const [peek, setPeek] = useState(null);
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMegaOpen(false);
    setPeek(null);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const onClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setMegaOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const nav = [
    ["/", "Home"],
    ["/shop", "Shop"],
    ...visibleGroups.slice(0, 4).map((g) => [`/shop/${g.id}`, g.name, g.id]),
    ["/brands", "Brands"],
    ["/special-orders", "Special orders"],
    ["/contact", "Contact"],
  ];

  return (
    <div className="cbar" onMouseLeave={() => setPeek(null)}>
      <div className="wrap">
        <div className="allcats" ref={containerRef}>
          <button onClick={() => setMegaOpen(!megaOpen)} aria-expanded={megaOpen} aria-controls="mega">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            All categories
          </button>
          {megaOpen && <MegaMenu />}
        </div>
        <nav className="cnav" aria-label="Main">
          {nav.map(([href, label, groupId]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onMouseEnter={() => setPeek(groupId || null)}
              onFocus={() => setPeek(groupId || null)}
            >
              {label}
            </Link>
          ))}
        </nav>
        {settings.promoText && (
          <span className="ship">
            {settings.promoText} <b>{settings.promoPrice}</b>
          </span>
        )}
      </div>
      {peek && !megaOpen && getGroup(peek) && <NavPanel group={getGroup(peek)} />}
    </div>
  );
}

export default function Header() {
  const { wish, compare, itemCount, total, openBag } = useStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <UtilityBar />
      <header className="top">
        <div className="wrap">
          <div className="hrow">
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="hicons">
                <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen} aria-controls="mnav">
                  <MenuIcon />
                </button>
              </span>
              <Logo />
            </div>
            <SearchForm />
            <div className="hicons">
              <Link className="hide-s" href="/compare" aria-label="Compare">
                <CompareIcon strokeWidth={1.6} />
                {compare.length > 0 && <span className="badge">{compare.length}</span>}
              </Link>
              <Link href="/wishlist" aria-label="Wishlist">
                <HeartIcon strokeWidth={1.6} />
                {wish.length > 0 && <span className="badge">{wish.length}</span>}
              </Link>
              <button className="bagbtn" onClick={openBag} aria-label="Bag">
                <span className="bagicon">
                  <BagIcon />
                  {itemCount > 0 && <span className="badge">{itemCount}</span>}
                </span>
                <span className="bagtxt">
                  <small>My bag</small>
                  <b>{plural(itemCount, "item")} / {money(total)}</b>
                </span>
              </button>
            </div>
          </div>
          <SearchForm mobile />
          <MobileNav open={menuOpen} />
        </div>
        <CategoryBar />
      </header>
    </>
  );
}