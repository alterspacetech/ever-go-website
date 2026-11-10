"use client";

import Link from "next/link";
import BrandCards from "@/components/BrandCards";
import { useCatalog } from "@/context/CatalogContext";

export default function BrandsView() {
  const { brands, settings } = useCatalog();
  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Brands</div>
          <h1>Shop by brand <span className="ar" lang="ar">الماركات</span></h1>
          {settings.brandsIntro && <p>{settings.brandsIntro}</p>}
        </div>
        <div className="brands"><BrandCards brands={brands} /></div>
      </div>
    </main>
  );
}