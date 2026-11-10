"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ProductVisual } from "@/components/ProductArt";
import { useCatalog } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { money } from "@/lib/format";

function LineList({ items }) {
  if (!items.length) return "-";
  return items.map((item, i) => (
    <Fragment key={item}>
      {i > 0 && <br />}
      {item}
    </Fragment>
  ));
}

export default function CompareView() {
  const { byId, getGroup, tiersFor } = useCatalog();
  const { compare, toggleCompare, addToBag } = useStore();
  const list = compare.map((id) => byId[id]);

  const rows = [
    ["photo", "", (p) => <div className="ph"><ProductVisual product={p} width={240} /></div>],
    ["name", "Product", (p) => <Link href={`/products/${p.id}`}><b>{p.name}</b></Link>],
    ["brand", "Brand", (p) => p.brand || "-"],
    ["category", "Category", (p) => p.category || getGroup(p.group).name],
    ["for", "For", (p) => p.for || "-"],
    ["scent", "Scent", (p) => p.scent || "-"],
    ["options", "Options", (p) => <LineList items={p.variants.map((v) => `${v.size}: ${money(v.price)}${v.inStock ? "" : " (out of stock)"}`)} />],
    ["bulk", "Bulk prices", (p) => <LineList items={p.variants.flatMap((v) => tiersFor(p, v.size).map((t) => `${v.size} ${t.min}+: ${money(t.price)}`))} />],
    ["stock", "Availability", (p) => (p.inStock ? "In stock" : "Out of stock")],
  ];

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Compare</div>
          <h1>Compare products</h1>
          <p>Compare up to 4 products side by side. Tap the compare icon on any product to add it.</p>
        </div>
        {list.length ? (
          <div className="cmpwrap">
            <table className="cmp-table">
              <tbody>
                {rows.map(([key, label, render]) => (
                  <tr key={key}>
                    <th>{label}</th>
                    {list.map((p) => <td key={p.id}>{render(p)}</td>)}
                  </tr>
                ))}
                <tr>
                  <th />
                  {list.map((p) => (
                    <td key={p.id}>
                      {p.inStock && p.variants.length === 1 ? (
                        <button className="btn red" style={{ padding: "8px 14px" }} onClick={() => addToBag(p.id, p.variants[0].size)}>Add to bag</button>
                      ) : (
                        <Link className="btn line" style={{ padding: "8px 14px" }} href={`/products/${p.id}`}>View</Link>
                      )}{" "}
                      <button className="rm" onClick={() => toggleCompare(p.id)}>Remove</button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="none">
            <b>Nothing to compare yet</b>Tap the compare icon on a product to add it.
            <br /><br />
            <Link className="btn line" href="/shop">Browse products</Link>
          </div>
        )}
      </div>
    </main>
  );
}
