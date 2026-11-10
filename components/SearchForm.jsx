"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Form({ mobile, query = "", params = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  useEffect(() => setValue(query), [query]);

  function submit(event) {
    event.preventDefault();
    const next = new URLSearchParams(params);
    const text = value.trim();
    if (text) next.set("q", text);
    else next.delete("q");
    const search = next.toString();
    router.push(search ? `/shop?${search}` : "/shop");
  }

  return (
    <form className={`hsearch${mobile ? " msearch" : ""}`} role="search" onSubmit={submit}>
      <input
        type="search"
        placeholder="Search products, brands or scents"
        aria-label="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">{mobile ? "Go" : "Search"}</button>
    </form>
  );
}

function FormWithParams({ mobile }) {
  const params = useSearchParams();
  return <Form mobile={mobile} query={params.get("q") || ""} params={params.toString()} />;
}

export default function SearchForm({ mobile = false }) {
  return (
    <Suspense fallback={<Form mobile={mobile} />}>
      <FormWithParams mobile={mobile} />
    </Suspense>
  );
}