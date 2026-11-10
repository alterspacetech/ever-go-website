"use client";

import { createContext, useContext, useMemo } from "react";
import { createCatalog } from "@/lib/catalog";

const CatalogContext = createContext(null);

export function CatalogProvider({ data, children }) {
  const catalog = useMemo(() => createCatalog(data), [data]);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useWhatsApp() {
  const { settings } = useCatalog();
  const link = (text) => `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;

  function open(text) {
    const anchor = document.createElement("a");
    anchor.href = link(text);
    anchor.target = "_blank";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return { link, open, display: settings.whatsappDisplay };
}
