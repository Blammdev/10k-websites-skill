"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { useCart } from "@/components/cart";

export function SiteHeader({ active }: { active?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const home = pathname === "/";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const solid = scrolled || !home;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        solid
          ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg tracking-tight text-white"
        >
          <span className="text-xl">🌱</span>
          <span>
            Lethargic <span className="italic text-emerald-300">Gardens</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={home ? `#${c.id}` : `/#${c.id}`}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                active === c.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {c.title}
            </Link>
          ))}
          <Link
            href="/merch"
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              pathname === "/merch" ? "bg-amber-200/15 text-amber-100" : "text-amber-200/80 hover:text-amber-100"
            }`}
          >
            Merch
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/merch"
            className="rounded-full px-3 py-1.5 text-sm text-amber-200/80 hover:text-amber-100 lg:hidden"
          >
            Merch
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80 transition hover:border-emerald-300/60 hover:text-white"
          >
            <span>Basket</span>
            <span
              key={count}
              className="toast-in grid h-5 min-w-5 place-items-center rounded-full bg-emerald-300 px-1 text-xs font-semibold text-black"
            >
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
