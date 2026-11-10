import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main>
      <div className="wrap">
        <div className="none">
          <b>We couldn't find that page</b>It may have moved, or the product may no longer be listed.
          <br />
          <br />
          <Link className="btn line" href="/shop">Browse products</Link>
        </div>
      </div>
    </main>
  );
}
