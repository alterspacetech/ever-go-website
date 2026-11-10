"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductRail({ products }) {
  const railRef = useRef(null);
  const [bar, setBar] = useState({ width: 100, left: 0 });

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const width = Math.min(100, (rail.clientWidth / rail.scrollWidth) * 100);
    const room = rail.scrollWidth - rail.clientWidth;
    setBar({ width, left: room > 0 ? (rail.scrollLeft / room) * (100 - width) : 0 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, products]);

  function move(direction) {
    const rail = railRef.current;
    rail?.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  }

  const canScroll = bar.width < 100;
  const atStart = bar.left <= 0.5;
  const atEnd = bar.left + bar.width >= 99.5;

  return (
    <div className="railbox">
      <div className="rail" ref={railRef} onScroll={measure}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {canScroll && (
        <div className="railctl">
          <div className="railbar" aria-hidden="true">
            <span style={{ width: `${bar.width}%`, left: `${bar.left}%` }} />
          </div>
          <button onClick={() => move(-1)} disabled={atStart} aria-label="Previous products">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 2 4 7l5 5" /></svg>
          </button>
          <button onClick={() => move(1)} disabled={atEnd} aria-label="More products">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 2 5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}