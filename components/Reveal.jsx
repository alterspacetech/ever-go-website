"use client";

import { useEffect, useRef } from "react";

/* Fades a section in as it scrolls into view. Anything already on screen, or for
   visitors who prefer reduced motion, is left alone, so nothing flashes or stays hidden. */
export default function Reveal({ as: Tag = "div", children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!element || reduced || element.getBoundingClientRect().top < window.innerHeight * 0.9) return undefined;

    element.classList.add("rv");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("rv-in");
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}