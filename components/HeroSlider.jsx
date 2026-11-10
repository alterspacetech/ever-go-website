"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import { Bottle, ProductVisual, RemoteImage } from "./ProductArt";

/* Each slide's picture sits on its own colour, so the hero has real contrast before photos are added. */
const PANELS = [
  { background: "#0B6B4B", circle: "rgba(255,255,255,.12)" },
  { background: "#07432F", circle: "rgba(255,255,255,.1)" },
  { background: "#D21F2B", circle: "rgba(255,255,255,.14)" },
];

function Scene({ background, circle }) {
  return (
    <svg viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="600" height="500" fill={background} />
      <circle cx="300" cy="270" r="190" fill={circle} />
      <Bottle x={190} y={410} scale={1.5} liquid="#141414" kind="burner" />
      <Bottle x={410} y={410} scale={1.35} liquid="#141414" kind="chips" />
      <Bottle x={300} y={430} scale={1.2} liquid="#E9D3A6" kind="attar" />
    </svg>
  );
}

function SlideVisual({ slide, index }) {
  const { byId } = useCatalog();
  const product = byId[slide.productId];
  const panel = PANELS[index % PANELS.length];
  return (
    <div className="v">
      {slide.image ? <RemoteImage src={slide.image} alt="" width={1200} /> : product ? <ProductVisual product={product} width={1200} {...panel} /> : <Scene {...panel} />}
    </div>
  );
}

function Slide({ slide, index, count, active }) {
  const Title = index === 0 ? "h1" : "h2";
  return (
    <div className={`slide${slide.green ? " g" : ""}${active ? " on" : ""}`} aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>
      <div className="t">
        {slide.eyebrow && (
          <span className="eyebrow" style={slide.green ? { color: "#FFB3B8" } : undefined}>
            {slide.eyebrow}
            {slide.eyebrowArabic && <> <span className="ar" lang="ar">{slide.eyebrowArabic}</span></>}
          </span>
        )}
        <Title>{slide.titleBefore}<span>{slide.titleAccent}</span>{slide.titleAfter}</Title>
        {slide.text && <p>{slide.text}</p>}
        <div className="ctas">
          {slide.primaryLabel && slide.primaryLink && (
            <Link className={`btn ${slide.green ? "white" : "red"}`} href={slide.primaryLink}>{slide.primaryLabel}</Link>
          )}
          {slide.secondaryLabel && slide.secondaryLink && (
            <Link className="btn line" href={slide.secondaryLink}>{slide.secondaryLabel}</Link>
          )}
        </div>
      </div>
      <SlideVisual slide={slide} index={index} />
    </div>
  );
}

export default function HeroSlider() {
  const { settings } = useCatalog();
  const slides = settings.hero;
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count, paused, resetCount]);

  if (!count) return null;

  function goTo(index) {
    setActive((index + count) % count);
    setResetCount((n) => n + 1);
  }

  return (
    <div className="slider" aria-roledescription="carousel" aria-label="Highlights">
      <div className="slides" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {slides.map((slide, i) => (
          <Slide key={slide.key || i} slide={slide} index={i} count={count} active={i === active} />
        ))}
      </div>
      {count > 1 && (
        <div className="sctl">
          <div className="dots">
            {slides.map((slide, i) => (
              <button key={slide.key || i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} aria-current={i === active} />
            ))}
          </div>
          <button className="ar-b" onClick={() => goTo(active - 1)} aria-label="Previous slide">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 2 4 7l5 5" /></svg>
          </button>
          <button className="ar-b" onClick={() => goTo(active + 1)} aria-label="Next slide">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 2 5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}