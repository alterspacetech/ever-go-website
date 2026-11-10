import Link from "next/link";

export default function Logo() {
  return (
    <Link className="logo" href="/">
      <span className="mk">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="7.5" y="2" width="9" height="5" rx="1" fill="#D21F2B" />
          <rect x="5" y="8" width="14" height="14" rx="3" fill="#fff" />
          <rect x="8" y="12" width="8" height="6" rx="1" fill="#0B6B4B" />
        </svg>
      </span>
      <span>
        <b>EVER<i>-</i>GO</b>
        <small>Fragrance World</small>
      </span>
    </Link>
  );
}
