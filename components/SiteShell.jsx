"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWhatsApp } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";import { money, plural } from "@/lib/format";
import BagDrawer from "./BagDrawer";
import Footer from "./Footer";
import Header from "./Header";
import { WhatsAppIcon } from "./Icons";
import QuickView from "./QuickView";

function CompareBar() {
  const { compare, clearCompare } = useStore();
  const pathname = usePathname();
  if (!compare.length || pathname === "/compare") return null;
  return (
    <div className="cmpbar">
      <span>{plural(compare.length, "product")} to compare</span>
      <Link href="/compare">Compare</Link>
      <button onClick={clearCompare}>Clear</button>
    </div>
  );
}

function MobileBagBar() {
  const { itemCount, total, openBag } = useStore();

  useEffect(() => {
    document.body.classList.toggle("has-bar", itemCount > 0);
  }, [itemCount]);

  return (
    <button className={`mbar${itemCount > 0 ? " show" : ""}`} onClick={openBag}>
      <span>{plural(itemCount, "item")} · {money(total)}</span>
      <span className="go">View bag</span>
    </button>
  );
}

function WhatsAppButton() {
  const whatsapp = useWhatsApp();
  return (
    <a className="wafab" href={whatsapp.link("Hello EVER-GO, I have a question.")} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
      <WhatsAppIcon />
    </a>
  );
}

function Toast() {
  const { toastState } = useStore();
  return (
    <div className={`toast${toastState.visible ? " show" : ""}`} role="status">
      {toastState.message}
    </div>
  );
}

export default function SiteShell({ children }) {
  const { bagOpen, quickViewId, closeBag, closeQuickView } = useStore();
  const pathname = usePathname();

  useEffect(() => closeQuickView(), [pathname, closeQuickView]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeQuickView();
        closeBag();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeBag, closeQuickView]);

  return (
    <>
      <Header />
      {children}
      <Footer />
      <CompareBar />
      <MobileBagBar />
        <WhatsAppButton />
      <div
        className={`scrim${bagOpen || quickViewId ? " open" : ""}`}
        onClick={() => {
          closeQuickView();
          closeBag();
        }}
      />
      <BagDrawer />
      {quickViewId && <QuickView key={quickViewId} productId={quickViewId} />}
      <Toast />
    </>
  );
}
