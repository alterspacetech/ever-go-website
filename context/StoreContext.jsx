"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { firstAvailable } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { useCatalog } from "./CatalogContext";

const StoreContext = createContext(null);

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browsing can block storage. The site still works for this visit. */
  }
}

export function StoreProvider({ children }) {
  const { byId, unitPrice } = useCatalog();
  const [bag, setBag] = useState({});
  const [wish, setWish] = useState([]);
  const [compare, setCompare] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);
  const [toastState, setToastState] = useState({ message: "", visible: false });
  const toastTimer = useRef();

  /* Saved items load after the first render, so the browser matches the pre-built page. */
  useEffect(() => {
    const cleanBag = {};
    Object.entries(load("eg-bag", {})).forEach(([key, qty]) => {
      const [id, size] = key.split("|");
      if (byId[id]?.variants.some((v) => v.size === size && v.inStock) && qty > 0) cleanBag[key] = qty;
    });
    setBag(cleanBag);
    setWish(load("eg-wish", []).filter((id) => byId[id]));
    setCompare(load("eg-cmp", []).filter((id) => byId[id]).slice(0, 4));
    setLoaded(true);
  }, [byId]);

  useEffect(() => {
    if (loaded) save("eg-bag", bag);
  }, [bag, loaded]);
  useEffect(() => {
    if (loaded) save("eg-wish", wish);
  }, [wish, loaded]);
  useEffect(() => {
    if (loaded) save("eg-cmp", compare);
  }, [compare, loaded]);

  const toast = useCallback((message) => {
    setToastState({ message, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState((t) => ({ ...t, visible: false })), 1900);
  }, []);

  const setQty = useCallback((key, qty) => {
    setBag((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[key];
      else next[key] = Math.min(qty, 999);
      return next;
    });
  }, []);

  const addToBag = useCallback(
    (id, size, qty = 1) => {
      const key = `${id}|${size}`;
      setBag((current) => ({ ...current, [key]: Math.min((current[key] || 0) + qty, 999) }));
      toast(`${byId[id].name} added to bag`);
    },
    [byId, toast]
  );

  const toggleWish = useCallback(
    (id) => {
      if (wish.includes(id)) {
        setWish(wish.filter((x) => x !== id));
        toast("Removed from wishlist");
      } else {
        setWish([...wish, id]);
        toast(`${byId[id].name} saved to wishlist`);
      }
    },
    [byId, wish, toast]
  );

  const toggleCompare = useCallback(
    (id) => {
      if (compare.includes(id)) {
        setCompare(compare.filter((x) => x !== id));
      } else if (compare.length >= 4) {
        toast("Compare holds up to 4 products");
      } else {
        setCompare([...compare, id]);
        toast(`${byId[id].name} added to compare`);
      }
    },
    [byId, compare, toast]
  );

  const clearCompare = useCallback(() => setCompare([]), []);

  const addWishlistToBag = useCallback(() => {
    const inStock = wish.map((id) => byId[id]).filter((p) => p.inStock);
    setBag((current) => {
      const next = { ...current };
      inStock.forEach((p) => {
        const key = `${p.id}|${firstAvailable(p).size}`;
        next[key] = (next[key] || 0) + 1;
      });
      return next;
    });
    toast(`${plural(inStock.length, "item")} added to bag`);
  }, [byId, wish, toast]);

  const lines = useMemo(
    () =>
      Object.entries(bag).map(([key, qty]) => {
        const [id, size] = key.split("|");
        const product = byId[id];
        const variant = product.variants.find((v) => v.size === size);
        return { key, product, variant, qty, unit: unitPrice(product, variant, qty), base: variant.price };
      }),
    [bag, byId, unitPrice]
  );
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.qty * l.unit, 0);

  const openBag = useCallback(() => {
    setQuickViewId(null);
    setBagOpen(true);
  }, []);
  const closeBag = useCallback(() => setBagOpen(false), []);
  const openQuickView = useCallback((id) => setQuickViewId(id), []);
  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  const value = {
    bag,
    wish,
    compare,
    lines,
    itemCount,
    total,
    bagOpen,
    quickViewId,
    toastState,
    toast,
    setQty,
    addToBag,
    toggleWish,
    toggleCompare,
    clearCompare,
    addWishlistToBag,
    openBag,
    closeBag,
    openQuickView,
    closeQuickView,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
