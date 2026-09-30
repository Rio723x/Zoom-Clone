import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Lazily reads `window.matchMedia` on first render (SPA, so no SSR flash) and
 * updates on change.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * True below Tailwind's `md` breakpoint (768px) — the exact complement of `md:`
 * so JS and CSS breakpoints never disagree.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
