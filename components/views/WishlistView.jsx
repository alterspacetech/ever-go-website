"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";

export default function WishlistView() {
  const { byId } = useCatalog();
  const { wish, addWishlistToBag } = useStore();
  const list = wish.map((id) => byId[id]);

  return (
    <main>
      <div className="wrap">
        <div className="phead">
          <div className="crumb"><Link href="/">Home</Link> / Wishlist</div>
          <h1>Your wishlist</h1>
          <p>Saved on this device. Add them to your bag when you're ready.</p>
        </div>
        <div style={{ marginBottom: 18 }}>
          {list.length > 0 && <button className="btn dark" onClick={addWishlistToBag}>Add all in-stock items to bag</button>}
        </div>
        <div className="grid">
          {list.length ? (
            list.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="none">
              <b>Your wishlist is empty</b>Tap the heart on any product to save it here.
              <br /><br />
              <Link className="btn line" href="/shop">Browse products</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
