"use client";

import Link from "next/link";
import { BRAND_LOGOS } from "@/lib/brandLogos";
import { plural } from "@/lib/format";

export default function BrandCards({ brands }) {
  if (!brands.length) return <div className="none">Brands appear here once products have a brand.</div>;
  return brands.map((brand) => {
    const logo = BRAND_LOGOS[brand.id];
    return (
      <Link key={brand.id} className="bcard" href={`/brands/${brand.id}`}>
        {logo ? (
          <span className={`logo${brand.id === "armaf" ? " dark" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" />
          </span>
        ) : (
          <span className="mono">{brand.name.slice(0, 1).toUpperCase()}</span>
        )}
        <b>{brand.name}</b>
        <span>{plural(brand.n, "product")}</span>
      </Link>
    );
  });
}
