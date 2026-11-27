"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { Reveal } from "@/components/motion";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const BEATS = [
  { s: 0, e: 0.26, text: "Plant a seed. Then do nothing." },
  { s: 0.26, e: 0.52, text: "Water it. The roots go first." },
  { s: 0.52, e: 0.78, text: "Leaves arrive when they're ready." },
  { s: 0.78, e: 1.01, text: "Flowers, fruit, dinner. Eventually." },
];

const ROOTS = [
  { d: "M320 458 C318 490 300 515 286 555", s: 0.1, e: 0.28 },
  { d: "M320 460 C326 495 346 520 362 558", s: 0.12, e: 0.3 },
  { d: "M319 475 C300 482 270 488 248 510", s: 0.18, e: 0.34 },
  { d: "M321 485 C340 490 372 494 396 514", s: 0.2, e: 0.36 },
];

const LEAVES = [
  { d: "M319 380 C286 384 258 366 250 338 C284 336 311 352 319 380 Z", s: 0.46, e: 0.58 },
  { d: "M321 350 C354 352 382 334 390 306 C356 306 329 322 321 350 Z", s: 0.52, e: 0.64 },
  { d: "M319 300 C292 300 270 282 266 258 C294 258 314 274 319 300 Z", s: 0.58, e: 0.68 },
  { d: "M320 250 C300 232 302 206 320 188 C338 206 340 232 320 250 Z", s: 0.64, e: 0.74 },
];

const LABELS = [
  { label: "House plants", target: "houseplants", x: 70, y: 320, w: 138, color: "#7ee0a1", link: "M208 337 H250", s: 0.66, e: 0.74 },
  { label: "Hemp seeds", target: "hemp", x: 412, y: 497, w: 164, color: "#b7f06a", link: "M396 514 H412", s: 0.38, e: 0.46 },
  { label: "Fruit", target: "fruit", x: 448, y: 214, w: 80, color: "#ff7a90", link: "M372 267 L448 231", s: 0.84, e: 0.92 },
  { label: "Vegetables", target: "vegetables", x: 462, y: 301, w: 124, color: "#ffb15e", link: "M442 318 H462", s: 0.88, e: 0.96 },
];

function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function HeroInner() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const collect = (sel: string) =>
      Array.from(el.querySelectorAll<HTMLElement | SVGElement>(sel)).map((n) => ({
        el: n as HTMLElement,
        s: Number((n as HTMLElement).dataset.s),
        e: Number((n as HTMLElement).dataset.e),
        click: (n as HTMLElement).dataset.click === "true",
      }));
    const draws = collect("[data-draw]");
    const fades = collect("[data-fade]");
    const beats = collect("[data-beat]");
    const cue = el.querySelector<HTMLElement>("[data-cue]");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const bg = el.querySelector<HTMLElement>("[data-bg]");
    const copy = el.querySelector<HTMLElement>("[data-copy]");

    let target = 0;
    let cur = -1;
    let last = -1;
    let raf = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      target = span > 0 ? clamp(-r.top / span) : 0;
    };

    const paint = (p: number) => {
      for (const d of draws) {
        const t = clamp((p - d.s) / (d.e - d.s));
        d.el.style.strokeDashoffset = String(1 - t);
        d.el.style.opacity = t > 0 ? "1" : "0";
      }
      for (const f of fades) {
        const t = clamp((p - f.s) / (f.e - f.s));
        f.el.style.opacity = String(t);
        f.el.style.visibility = t > 0.02 ? "visible" : "hidden";
        if (f.click) f.el.style.pointerEvents = t > 0.7 ? "auto" : "none";
      }
      for (const b of beats) {
        const a = b.s === 0 ? 1 : clamp((p - b.s) / 0.04);
        const z = b.e > 1 ? 1 : clamp((b.e - p) / 0.04);
        const o = Math.min(a, z);
        b.el.style.opacity = String(o);
        b.el.style.transform = `translateY(${(1 - o) * 12}px)`;
        b.el.style.visibility = o > 0.02 ? "visible" : "hidden";
      }
      if (cue) cue.style.opacity = String(1 - clamp(p / 0.06));
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (bg) {
        bg.style.transform = `translate3d(0, ${p * 60}px, 0) scale(${1.06 + p * 0.1})`;
        bg.style.opacity = String(0.55 - p * 0.3);
      }
      if (copy) copy.style.opacity = String(1 - clamp(p / 0.3) * 0.35);
    };

    const tick = () => {
      cur = cur < 0 ? target : cur + (target - cur) * (reduce ? 1 : 0.16);
      if (Math.abs(target - cur) < 4e-4) cur = target;
      if (cur !== last) {
        paint(cur);
        last = cur;
      }
      raf = cur !== target ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const drawStyle: CSSProperties = { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 };
  const hidden: CSSProperties = { opacity: 0, visibility: "hidden" };

  return (
    <section
      id="top"
      ref={root}
      aria-label="Lethargic Gardens"
      className="relative h-[340svh] bg-ink text-white"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-16 lg:flex-row lg:items-center">
        <div
          data-bg
          aria-hidden="true"
          className="absolute inset-0 will-change-transform"
          style={{ opacity: 0.55, transform: "scale(1.06)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-ink" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_40%,rgba(52,211,153,0.14),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#a7f3d0 1px, transparent 1px), linear-gradient(90deg, #a7f3d0 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          data-copy
          className="relative z-10 flex flex-none flex-col justify-center px-5 pt-4 sm:px-8 sm:pt-6 lg:w-[46%] lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-6"
        >
          <p className="mb-5 hidden w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-emerald-200 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Seeds for the unhurried gardener
          </p>
          <h1 className="font-display text-[2.6rem] font-light leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            Grow <em className="text-emerald-300">slowly.</em>
            <br />
            Grow <em className="text-amber-200">well.</em>
          </h1>
          <p className="mt-6 hidden max-w-md text-lg leading-relaxed text-white/70 sm:[@media(min-height:760px)]:block">
            House plants, vegetables, fruit and hemp seeds. Carefully sourced, honestly described, and
            never rushed. Nothing here needs to happen today.
          </p>
          <div className="mt-7 hidden flex-wrap gap-3 sm:flex">
            <button
              onClick={() => jump("houseplants")}
              className="rounded-full bg-emerald-300 px-7 py-3 text-sm font-medium text-black transition hover:bg-emerald-200"
            >
              Browse the seeds
            </button>
            <Link
              href="/merch"
              className="rounded-full border border-amber-200/40 px-7 py-3 text-sm text-amber-100 transition hover:border-amber-200"
            >
              Shop merch
            </Link>
            <button
              onClick={() => jump("how")}
              className="rounded-full border border-white/20 px-7 py-3 text-sm text-white/90 transition hover:border-white/50"
            >
              How it works
            </button>
          </div>
          <div className="relative mt-4 h-14 sm:mt-7 sm:h-16 lg:mt-10 lg:h-24" aria-live="off">
            {BEATS.map((b) => (
              <p
                key={b.text}
                data-beat
                data-s={b.s}
                data-e={b.e}
                className="absolute inset-x-0 top-0 font-display text-[1.35rem] font-light italic leading-tight text-emerald-200 sm:text-3xl lg:text-[2.3rem]"
              >
                {b.text}
              </p>
            ))}
          </div>
          <div
            data-fade
            data-click="true"
            data-s="0.86"
            data-e="0.94"
            style={hidden}
            className="mt-1 flex flex-wrap gap-2 sm:hidden"
          >
            {LABELS.map((l) => (
              <button
                key={l.target}
                onClick={() => jump(l.target)}
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: `${l.color}88`, color: l.color }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 px-3 pb-6 lg:pb-0 lg:pr-[max(1rem,calc((100vw-80rem)/2+1rem))]">
          <svg
            viewBox="0 0 640 580"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            role="img"
            aria-label="A seed sprouting roots, then a stem, leaves and fruit as you scroll"
          >
            <g stroke="#5f8a70" strokeWidth="2" strokeLinecap="round">
              <path data-draw data-s="0" data-e="0.1" pathLength={1} style={drawStyle} d="M0 420 H640" />
            </g>
            <g
              data-fade
              data-s="0.06"
              data-e="0.16"
              style={hidden}
              stroke="#5f8a70"
              strokeWidth="1.2"
              strokeDasharray="3 9"
              opacity="0.6"
            >
              <path d="M0 470 H640" />
              <path d="M0 525 H640" />
            </g>
            <g data-fade data-s="0.02" data-e="0.1" style={hidden}>
              <ellipse cx="320" cy="452" rx="12" ry="8" transform="rotate(-18 320 452)" fill="#e6c27a" />
              <path d="M312 450 Q320 446 328 450" stroke="#8a6a2c" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <g stroke="#bcd3e6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
              <path
                data-draw
                data-s="0.12"
                data-e="0.24"
                pathLength={1}
                style={drawStyle}
                d="M80 130 Q80 104 108 104 Q118 78 150 84 Q178 72 194 98 Q226 98 226 126 Q226 130 216 130 Z"
              />
            </g>
            <g data-fade data-s="0.2" data-e="0.3" style={hidden} stroke="#8fd0ee" strokeWidth="2.5" strokeLinecap="round">
              {[120, 152, 184].map((x, i) => (
                <path key={x} className="drip" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x} 146 V160`} />
              ))}
            </g>
            <g stroke="#c9a27a" strokeWidth="2.4" strokeLinecap="round">
              {ROOTS.map((r) => (
                <path key={r.d} data-draw data-s={r.s} data-e={r.e} pathLength={1} style={drawStyle} d={r.d} />
              ))}
            </g>
            <g className="sway">
              <g stroke="#7ee0a1" strokeWidth="3" strokeLinecap="round">
                <path data-draw data-s="0.3" data-e="0.52" pathLength={1} style={drawStyle} d="M320 446 C324 400 314 340 320 250" />
              </g>
              <g stroke="#7ee0a1" strokeWidth="2.2" strokeLinejoin="round">
                {LEAVES.map((l) => (
                  <path key={l.d} data-draw data-s={l.s} data-e={l.e} pathLength={1} style={drawStyle} d={l.d} />
                ))}
              </g>
              {LEAVES.map((l) => (
                <path
                  key={`f-${l.d}`}
                  data-fade
                  data-s={l.s + 0.04}
                  data-e={l.e + 0.06}
                  style={hidden}
                  d={l.d}
                  fill="rgba(126,224,161,0.18)"
                />
              ))}
              <g stroke="#7ee0a1" strokeWidth="2.2" strokeLinecap="round">
                <path data-draw data-s="0.72" data-e="0.8" pathLength={1} style={drawStyle} d="M320 282 C350 262 390 262 428 282" />
                <path data-draw data-s="0.74" data-e="0.82" pathLength={1} style={drawStyle} d="M320 222 C296 206 266 206 244 224" />
              </g>
              <g data-fade data-s="0.8" data-e="0.9" style={hidden}>
                <path d="M372 267 V292" stroke="#7ee0a1" strokeWidth="2" />
                <circle cx="372" cy="302" r="11" fill="#ff7a90" />
                <path d="M428 282 V304" stroke="#7ee0a1" strokeWidth="2" />
                <circle cx="428" cy="318" r="15" fill="#ffb15e" />
                <path d="M262 211 V234" stroke="#7ee0a1" strokeWidth="2" />
                <circle cx="262" cy="244" r="10" fill="#8aa4ff" />
              </g>
              <g data-fade data-s="0.88" data-e="0.98" style={hidden}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle
                    key={a}
                    cx={320 + Math.cos((a * Math.PI) / 180) * 11}
                    cy={176 + Math.sin((a * Math.PI) / 180) * 11}
                    r="7"
                    fill="#fff1c2"
                  />
                ))}
                <circle cx="320" cy="176" r="5.5" fill="#f5b942" />
              </g>
            </g>
            <g data-fade data-s="0.5" data-e="0.62" style={hidden} stroke="#ffd37a" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="540" cy="104" r="24" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <path
                    key={i}
                    d={`M${540 + Math.cos(a) * 36} ${104 + Math.sin(a) * 36} L${540 + Math.cos(a) * 46} ${104 + Math.sin(a) * 46}`}
                  />
                );
              })}
            </g>
            {LABELS.map((l) => (
              <g
                key={l.target}
                className="max-sm:hidden"
                data-fade
                data-click="true"
                data-s={l.s}
                data-e={l.e}
                style={{ ...hidden, cursor: "pointer", pointerEvents: "none" }}
                role="link"
                tabIndex={0}
                aria-label={`Jump to ${l.label}`}
                onClick={() => jump(l.target)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && jump(l.target)}
              >
                <path d={l.link} stroke={l.color} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.8" />
                <rect x={l.x} y={l.y} width={l.w} height="34" rx="17" fill="rgba(7,10,8,0.78)" stroke={l.color} strokeWidth="1.5" />
                <text x={l.x + l.w / 2} y={l.y + 22} textAnchor="middle" fill="#fff" fontSize="15" fontFamily="Inter, sans-serif">
                  {l.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div
          data-cue
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/50 sm:flex"
        >
          Scroll
          <span className="cue-line h-10 w-px bg-gradient-to-b from-white/60 to-transparent" />
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/5">
          <div
            data-bar
            className="h-full origin-left bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-200"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroInner);

export function Marquee() {
  const base = [
    "House plants",
    "Vegetables",
    "Fruit",
    "Hemp seeds",
    "Merch",
    "Heirloom",
    "Slow grown",
    "Open pollinated",
  ];
  const all = [...base, ...base];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-moss py-5">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {[...all, ...all].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl italic text-white/60">
            {t}
            <span className="text-emerald-300">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Pick a pace", d: "Every packet lists realistic germination and harvest windows, with no miracle claims." },
    { n: "02", t: "Sow and wait", d: "Fresh, tested seed with simple instructions. Water, light, and a little neglect." },
    { n: "03", t: "Enjoy eventually", d: "Leaves, fruit, flowers and dinner arrive when they are ready, not before." },
  ];
  return (
    <section id="how" className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">The method</p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-light leading-tight text-white sm:text-6xl">
          A gentler way to <em className="text-emerald-300">garden.</em>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 130}>
            <div className="group h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 transition duration-500 hover:-translate-y-1 hover:border-emerald-300/40">
              <span className="font-display text-5xl font-light text-emerald-300/70">{s.n}</span>
              <h3 className="mt-6 font-display text-2xl text-white">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-white/60">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function OnlineOrdering() {
  const items = [
    { e: "🛒", t: "Order online", d: "Fill a basket from the full catalog, seeds and merch, any time of day." },
    { e: "🔄", t: "Synced to our register", d: "Every order lands in the shop POS and stock counts stay in step, so what you see is what is on the shelf." },
    { e: "📦", t: "Pickup or shipping", d: "Free local pickup, or flat-rate shipping that is free over $50. Hemp ships only where legal." },
  ];
  return (
    <section id="order" className="relative px-5 pb-28 sm:px-8">
      <Reveal variant="scale">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-moss to-ink p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
          <p className="relative text-xs uppercase tracking-[0.25em] text-emerald-300">Online ordering</p>
          <h2 className="relative mt-4 max-w-2xl font-display text-4xl font-light leading-tight text-white sm:text-6xl">
            Order online. <em className="text-emerald-300">Collect slowly.</em>
          </h2>
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {items.map((it) => (
              <div key={it.t} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <span className="text-3xl">{it.e}</span>
                <h3 className="mt-4 font-display text-xl text-white">{it.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function MerchTeaser() {
  return (
    <section className="px-5 pb-28 sm:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <Reveal variant="left">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200">New · Merch</p>
          <h2 className="mt-4 font-display text-5xl font-light leading-none text-white sm:text-6xl">
            Wear the <em className="text-amber-200">pace.</em>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
            Tees, hoodies, a very relaxed dad hat and a mug for your windowsill coffee. Small
            batches, soft fabrics, no urgency.
          </p>
          <Link
            href="/merch"
            className="mt-8 inline-block rounded-full bg-amber-200 px-7 py-3 text-sm font-medium text-black transition hover:bg-amber-100"
          >
            Shop the merch
          </Link>
        </Reveal>
        <Reveal variant="scale" delay={120}>
          <Link href="/merch" className="block overflow-hidden rounded-[2rem] border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/merch.jpg"
              alt="Lethargic Gardens merch"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover transition duration-700 hover:scale-105"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="px-5 pb-28 sm:px-8">
      <Reveal variant="scale">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-moss px-8 py-20 text-center">
          <div className="float absolute -left-6 top-6 text-6xl opacity-40">🌿</div>
          <div className="float absolute -right-4 bottom-8 text-7xl opacity-30" style={{ animationDelay: "-3s" }}>
            🍃
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(52,211,153,0.18),transparent)]" />
          <h2 className="relative font-display text-4xl font-light text-white sm:text-6xl">
            No rush. <em className="text-emerald-300">Just seeds.</em>
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-white/60">
            Get a slow monthly note on what to sow next. We send one email, whenever we feel like it.
          </p>
          {done ? (
            <p className="relative mt-8 text-emerald-200">Thank you. We will write when we feel like it. 🌱</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
              className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@lazygarden.com"
                className="flex-1 rounded-full border border-white/15 bg-black/40 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-300/60"
              />
              <button className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-medium text-black transition hover:bg-emerald-200">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 text-sm text-white/40 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span className="font-display text-white/70">🌱 Lethargic Gardens</span>
        <span className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/merch" className="hover:text-white/70">Merch</Link>
          <Link href="/admin" className="hover:text-white/70">Staff</Link>
          <span>© {new Date().getFullYear()} Lethargic Gardens. Hemp seeds ship only where legal.</span>
        </span>
      </div>
    </footer>
  );
}
