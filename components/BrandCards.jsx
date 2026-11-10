"use client";

import Link from "next/link";
import { plural } from "@/lib/format";

export default function BrandCards({ brands }) {
  if (!brands.length) return <div className="none">Brands appear here once products have a brand.</div>;
  return brands.map((brand) => (
    <Link key={brand.id} className="bcard" href={`/brands/${brand.id}`}>
      <span className="mono">{brand.name.slice(0, 1).toUpperCase()}</span>
      <b>{brand.name}</b>
      <span>{plural(brand.n, "product")}</span>
    </Link>
  ));
}
