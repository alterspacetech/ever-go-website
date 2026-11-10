"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { minPrice } from "@/lib/catalog";
import { plural } from "@/lib/format";

const NO_PARAMS = new URLSearchParams();

function ShopContent({ groupId, brandId, params, pathname }) {
  const { products, brands, visibleGroups, getGroup, countInGroup, newestFirst, settings } = useCatalog();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const forOptions = useMemo(() => ["All", ...new Set(products.map((p) => p.for).filter(Boolean))], [products]);

  const sorters = useMemo(
    () => ({
      feat: (a, b) => b.inStock - a.inStock || a.idx - b.idx,
      new: newestFirst,
      lo: (a, b) => minPrice(a) - minPrice(b),
      hi: (a, b) => minPrice(b) - minPrice(a),
      az: (a, b) => a.name.localeCompare(b.name),
    }),
    [newestFirst]
  );

  const group = groupId ? getGroup(groupId) : null;
  const brand = brandId ? brands.find((b) => b.id === brandId) : null;
  const query = params.get("q") || "";
  const forParam = params.get("for");
  const forWho = forOptions.includes(forParam) ? forParam : "All";
  const stock = params.get("stock") === "1";
  const sort = sorters[params.get("sort")] ? params.get("sort") : "feat";

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          (!group || p.group === group.id) &&
          (!brand || p.brandId === brand.id) &&
          (forWho === "All" || p.for === forWho || (forWho !== "Unisex" && p.for === "Unisex")) &&
          (!stock || p.inStock) &&
          (!q || `${p.name} ${p.brand} ${p.scent} ${p.category} ${p.desc}`.toLowerCase().includes(q))
      )
      .sort(sorters[sort]);
  }, [products, group, brand, forWho, stock, sort, query, sorters]);

  /* Updates the address without reloading, and useSearchParams picks up the change. */
  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const search = next.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }

  /* Category and brand links keep the "for", stock and sort filters but clear the search. */
  const kept = new URLSearchParams(params);
  kept.delete("q");
  const shopLink = (path) => (kept.toString() ? `${path}?${kept}` : path);

  const title = brand ? brand.name : group ? group.name : "Shop all";
  const blurb = brand
    ? `Everything we stock from ${brand.name}.`
    : group
      ? group.blurb
      : settings.shopIntro;

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb">
            <Link href="/">Home</Link>
            {" / "}
            {brand ? (
              <><Link href="/brands">Brands</Link> / {brand.name}</>
            ) : (
              <><Link href="/shop">Shop</Link>{group && ` / ${group.name}`}</>
            )}
          </div>
          <h1>
            {title}
            {group && !brand && <span className="ar" lang="ar">{group.ar}</span>}
          </h1>
          <p>{blurb}</p>
        </div>

        <div className="shop">
          {filtersOpen && <div className="sheet-scrim" onClick={() => setFiltersOpen(false)} />}
          <aside className={`side${filtersOpen ? " open" : ""}`}>
            <details open>
              <summary>Categories</summary>
              <div>
                <Link href={shopLink("/shop")} aria-current={!group && !brand ? "page" : undefined}>
                  All products<span>{products.length}</span>
                </Link>
                {visibleGroups.map((g) => (
                  <Link key={g.id} href={shopLink(`/shop/${g.id}`)} aria-current={group?.id === g.id ? "page" : undefined}>
                    {g.name}<span>{countInGroup(g.id)}</span>
                  </Link>
                ))}
              </div>
            </details>
            <details open>
              <summary>Brand</summary>
              <div>
                {brands.length ? (
                  brands.map((b) => (
                    <Link key={b.id} href={shopLink(`/brands/${b.id}`)} aria-current={brand?.id === b.id ? "page" : undefined}>
                      {b.name}<span>{b.n}</span>
                    </Link>
                  ))
                ) : (
                  <span className="opt">No brands yet</span>
                )}
              </div>
            </details>
            <details open>
              <summary>For</summary>
              <div>
                {forOptions.map((option) => (
                  <button key={option} className="opt" aria-pressed={forWho === option} onClick={() => setFilter("for", option === "All" ? "" : option)}>
                    {option}
                  </button>
                ))}
              </div>
            </details>
            <details open>
              <summary>Availability</summary>
              <label className="tg">
                <input type="checkbox" checked={stock} onChange={(e) => setFilter("stock", e.target.checked ? "1" : "")} /> In stock only
              </label>
            </details>
            <button className="btn green sheet-done" onClick={() => setFiltersOpen(false)}>
              Show {plural(list.length, "product")}
            </button>
          </aside>

          <div>
            <div className="tbar">
              <button className="btn line fbtn" style={{ padding: "8px 14px" }} onClick={() => setFiltersOpen(!filtersOpen)}>Filters</button>
              <span className="count">{plural(list.length, "product")}</span>
              <div className="chipsel">
                {query && <button onClick={() => setFilter("q", "")}>Search: {query} ×</button>}
                {forWho !== "All" && <button onClick={() => setFilter("for", "")}>For {forWho} ×</button>}
                {stock && <button onClick={() => setFilter("stock", "")}>In stock ×</button>}
              </div>
              <select aria-label="Sort" value={sort} onChange={(e) => setFilter("sort", e.target.value === "feat" ? "" : e.target.value)}>
                <option value="feat">Featured</option>
                <option value="new">Newest</option>
                <option value="lo">Price: low to high</option>
                <option value="hi">Price: high to low</option>
                <option value="az">Name: A to Z</option>
              </select>
            </div>
            <div className="grid c3">
              {list.length ? (
                list.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <div className="none">
                  <b>Nothing found</b>Try another search, or <Link href="/special-orders">request a special order</Link>.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ShopWithParams(props) {
  const params = useSearchParams();
  return <ShopContent {...props} params={params} />;
}

/* The fallback is the unfiltered shop, so the pre-built page still contains every product. */
export default function ShopPage({ groupId, brandId }) {
  const pathname = usePathname();
  const shared = { groupId, brandId, pathname };
  return (
    <Suspense fallback={<ShopContent {...shared} params={NO_PARAMS} />}>
      <ShopWithParams {...shared} />
    </Suspense>
  );
}