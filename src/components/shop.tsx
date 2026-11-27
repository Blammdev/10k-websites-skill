"use client";

import { useState } from "react";
import { money, type CategoryMeta } from "@/lib/catalog";
import { useCart } from "@/components/cart";
import { Parallax, Reveal } from "@/components/motion";

export type ShopProduct = {
  id: string;
  name: string;
  emoji: string;
  note: string;
  tag: string;
  detail: string;
  priceCents: number;
  stock: number;
  isHemp: boolean;
};

export function ProductCard({ p, cat }: { p: ShopProduct; cat: CategoryMeta }) {
  const [hover, setHover] = useState(false);
  const { add, lines } = useCart();
  const inCart = lines.find((l) => l.id === p.id)?.quantity ?? 0;
  const soldOut = p.stock <= 0;
  const atMax = inCart >= p.stock;

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-soil p-6 transition duration-500 hover:-translate-y-1.5 hover:border-white/25 ${
        soldOut ? "opacity-70" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: cat.glow }}
      />
      <div className="relative flex items-start justify-between">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-4xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
          {p.emoji}
        </span>
        <span
          className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider"
          style={{ color: cat.accent, borderColor: `${cat.accent}55` }}
        >
          {p.tag}
        </span>
      </div>
      <h3 className="relative mt-6 font-display text-2xl text-white">{p.name}</h3>
      <p className="relative mt-1 text-sm text-white/55">{p.note}</p>
      <p className="relative mt-4 text-xs uppercase tracking-wider text-white/40">{p.detail}</p>
      <p className="relative mt-2 text-xs">
        {soldOut ? (
          <span className="text-rose-300">Sold out</span>
        ) : p.stock <= 10 ? (
          <span className="text-amber-200">Only {p.stock} left</span>
        ) : (
          <span className="text-white/35">In stock</span>
        )}
      </p>
      <div className="relative mt-auto flex items-center justify-between pt-6">
        <span className="font-display text-2xl text-white">{money(p.priceCents)}</span>
        <button
          disabled={soldOut || atMax}
          onClick={() =>
            add({
              id: p.id,
              name: p.name,
              priceCents: p.priceCents,
              emoji: p.emoji,
              isHemp: p.isHemp,
              max: p.stock,
            })
          }
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:border-transparent hover:text-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
          style={{ background: hover && !soldOut && !atMax ? cat.accent : "transparent" }}
        >
          {soldOut ? "Sold out" : atMax ? "In basket" : "Add"}
        </button>
      </div>
    </div>
  );
}

export function CategorySection({
  cat,
  index,
  products,
  numbered = true,
}: {
  cat: CategoryMeta;
  index: number;
  products: ShopProduct[];
  numbered?: boolean;
}) {
  const flip = index % 2 === 1;
  return (
    <section id={cat.id} className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-70"
        style={{
          background: `radial-gradient(50% 60% at ${flip ? "80%" : "20%"} 0%, ${cat.glow}, transparent)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-2">
          <Reveal variant={flip ? "right" : "left"} className={flip ? "lg:order-2" : ""}>
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: cat.accent }}>
              {numbered ? `${String(index + 1).padStart(2, "0")} · ` : ""}
              {cat.kicker}
            </p>
            <h2 className="mt-4 font-display text-5xl font-light leading-none text-white sm:text-7xl">
              {cat.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">{cat.blurb}</p>
            {cat.id === "hemp" && (
              <p className="mt-5 max-w-lg rounded-2xl border border-lime-300/20 bg-lime-300/5 px-4 py-3 text-sm text-lime-100/80">
                Laws vary, so please check the rules where you live before you order. Hemp seeds ship
                only where legal.
              </p>
            )}
          </Reveal>
          <Reveal variant="scale" delay={150} className={flip ? "lg:order-1" : ""}>
            <Parallax className="aspect-[16/10] rounded-[2rem] border border-white/10" speed={0.08}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="h-[125%] w-full -translate-y-[10%] object-cover"
              />
            </Parallax>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 110}>
              <ProductCard p={p} cat={cat} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
