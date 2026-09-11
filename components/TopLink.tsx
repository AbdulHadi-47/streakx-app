"use client";

import Link from "next/link";
import { useEffect, type MouseEvent, type ReactNode } from "react";

const SCROLL_KEY = "streakx:scroll-to-top";

export default function TopLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  useEffect(() => {
    if (sessionStorage.getItem(SCROLL_KEY) !== "1") return;
    sessionStorage.removeItem(SCROLL_KEY);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const destination = new URL(href, window.location.href);
    if (destination.pathname === window.location.pathname) {
      event.preventDefault();
      window.history.replaceState(window.history.state, "", destination.href);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem(SCROLL_KEY, "1");
  }

  return <Link href={href} className={className} aria-label={ariaLabel} onClick={navigate}>{children}</Link>;
}
