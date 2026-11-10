"use client";

import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/format";

const LIQUIDS = ["#E9D3A6", "#D9A35A", "#D21F2B", "#0B6B4B", "#B5651D", "#EFE2C6", "#8E2A1E"];
const GOLD = "#B08A4A";
const GOLD_LIGHT = "#D8BE86";
const GLASS = "rgba(255,255,255,.65)";

function hashIndex(text, size) {
  let hash = 7;
  for (const ch of text) hash = (hash * 131 + ch.charCodeAt(0) * 17) >>> 0;
  return (hash >>> 3) % size;
}

function Shadow({ rx, opacity = 0.06 }) {
  return <ellipse cx="0" cy="2" rx={rx} ry="6" fill={`rgba(0,0,0,${opacity})`} />;
}

function Smoke({ d }) {
  return <path d={d} stroke="#C9C4BA" strokeWidth="5" fill="none" strokeLinecap="round" />;
}

const shapes = {
  attar: (liquid) => (
    <>
      <Shadow rx="46" />
      <path d="M0 -150c6 8 14 12 14 22a14 14 0 0 1-28 0c0-10 8-14 14-22Z" fill={GOLD} />
      <rect x="-4" y="-116" width="8" height="10" fill={GOLD} />
      <rect x="-8" y="-106" width="16" height="30" rx="3" fill={GLASS} />
      <rect x="-12" y="-78" width="24" height="6" rx="3" fill={GOLD} />
      <path d="M0 -72c-34 0-46 18-46 38S-26 0 0 0s46-14 46-34-12-38-46-38Z" fill={GLASS} />
      <path d="M0 -62c-26 0-38 14-38 30s16 26 38 26 38-10 38-26-12-30-38-30Z" fill={liquid} />
      <path d="M-26 -44a28 28 0 0 1 14-14" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
    </>
  ),
  jar: (liquid) => (
    <>
      <Shadow rx="56" />
      <rect x="-50" y="-74" width="100" height="22" rx="4" fill={GOLD} />
      <rect x="-46" y="-52" width="92" height="52" rx="10" fill={liquid} />
      <rect x="-22" y="-40" width="44" height="26" fill="#fff" />
      <rect x="-14" y="-30" width="28" height="2" fill="#141414" />
    </>
  ),
  burner: (liquid) => {
    const body = liquid === "black" ? "#141414" : liquid;
    return (
      <>
        <Shadow rx="50" opacity={0.07} />
        <Smoke d="M-16 -150c-10-12 10-18 0-30M4 -146c-10-12 10-18 0-30M24 -150c-10-12 10-18 0-30" />
        <circle cx="0" cy="-134" r="7" fill={GOLD} />
        <path d="M-34 -96c0-22 15-32 34-32s34 10 34 32Z" fill={body} />
        <rect x="-40" y="-96" width="80" height="12" rx="3" fill={GOLD} />
        <path d="M-32 -84h64l-10 46h-44Z" fill={body} />
        <rect x="-26" y="-38" width="52" height="10" fill={GOLD} />
        <rect x="-36" y="-28" width="72" height="28" rx="4" fill={body} />
      </>
    );
  },
  chips: () => (
    <>
      <Shadow rx="56" />
      <Smoke d="M-16 -96c-10-12 10-18 0-30M8 -94c-10-12 10-18 0-30" />
      <ellipse cx="0" cy="-58" rx="52" ry="12" fill="#6E3F27" />
      <rect x="-14" y="-72" width="16" height="12" rx="3" fill="#8E5A3A" transform="rotate(-20 -6 -66)" />
      <rect x="4" y="-76" width="20" height="12" rx="3" fill="#5A321F" transform="rotate(14 14 -70)" />
      <path d="M-56 -58h112c0 34-24 58-56 58s-56-24-56-58Z" fill="#0B6B4B" />
    </>
  ),
  ball: (liquid) => (
    <>
      <Shadow rx="40" opacity={0.07} />
      <circle cx="0" cy="-44" r="44" fill={liquid} />
      <path d="M-40 -56c26 10 54 10 80 0M-34 -20c22-10 46-10 68 0" stroke="rgba(255,255,255,.55)" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),
  perfume: (liquid) => (
    <>
      <Shadow rx="48" opacity={0.07} />
      <rect x="-20" y="-148" width="40" height="34" rx="3" fill={GOLD} />
      <rect x="-20" y="-148" width="9" height="34" fill={GOLD_LIGHT} />
      <rect x="-10" y="-114" width="20" height="10" fill="#CDBF9E" />
      <rect x="-44" y="-104" width="88" height="104" rx="8" fill={GLASS} />
      <rect x="-38" y="-86" width="76" height="80" rx="5" fill={liquid} />
      <rect x="-38" y="-86" width="76" height="12" fill="rgba(255,255,255,.25)" />
      <rect x="-17" y="-62" width="34" height="34" fill="#fff" opacity=".92" />
      <rect x="-10" y="-50" width="20" height="2" fill="#141414" />
      <rect x="-7" y="-44" width="14" height="1.5" fill="#6E6C67" />
      <rect x="-36" y="-98" width="5" height="90" rx="2.5" fill="#fff" opacity=".6" />
    </>
  ),
};

export function Bottle({ x, y, scale, liquid, kind }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{shapes[kind](liquid)}</g>;
}

export function ProductArt({ product, background = "#F0EDE6", circle = "#E4E0D6", fit = "xMidYMid slice" }) {
  const kind = shapes[product.illustration] ? product.illustration : "perfume";
  let liquid = LIQUIDS[hashIndex(product.name, LIQUIDS.length)];
  if (kind === "burner") liquid = GOLD;

  return (
    <svg className="art" viewBox="0 0 400 400" preserveAspectRatio={fit} aria-hidden="true">
      <rect width="400" height="400" fill={background} />
      <circle cx="200" cy="210" r="128" fill={circle} />
      <Bottle x={200} y={318} scale={1.7} liquid={liquid} kind={kind} />
    </svg>
  );
}

export function RemoteImage({ src, alt, width = 600 }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  /* An image can fail before the page becomes interactive, which onError would miss. */
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return null;
  return <img ref={ref} src={imageUrl(src, width)} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

/* The illustration always renders underneath, so a missing photo never leaves a gap. */
export function ProductVisual({ product, width, background, circle, fit }) {
  return (
    <>
      <ProductArt product={product} background={background} circle={circle} fit={fit} />
      {product.photo && <RemoteImage key={product.photo} src={product.photo} alt={product.name} width={width} />}
    </>
  );
}