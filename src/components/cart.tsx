"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FREE_SHIPPING_OVER_CENTS, money } from "@/lib/catalog";

export type CartLine = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  emoji: string;
  isHemp: boolean;
  max: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toast: { id: number; text: string } | null;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "lg-cart-v2";

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) setLines(raw);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(lines));
      } catch {}
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const add = useCallback((line: Omit<CartLine, "quantity">) => {
    setLines((ls) => {
      const ex = ls.find((l) => l.id === line.id);
      if (ex) {
        return ls.map((l) =>
          l.id === line.id ? { ...l, ...line, quantity: Math.min(l.quantity + 1, line.max) } : l,
        );
      }
      return [...ls, { ...line, quantity: 1 }];
    });
    setToast({ id: Date.now(), text: `${line.name} added to basket` });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2000);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((ls) =>
      ls
        .map((l) => (l.id === id ? { ...l, quantity: Math.min(qty, l.max) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);
  const remove = useCallback((id: string) => setLines((ls) => ls.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotalCents: lines.reduce((s, l) => s + l.priceCents * l.quantity, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      toast,
    }),
    [lines, open, add, setQty, remove, clear, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-black/80 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-xl"
        >
          ✓ {toast.text}
        </div>
      )}
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const { open, setOpen, lines, subtotalCents, setQty, remove } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  if (!open) return null;

  const toFree = Math.max(0, FREE_SHIPPING_OVER_CENTS - subtotalCents);

  return (
    <div className="fixed inset-0 z-[99999] text-[#eff9f0]">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lg-title"
        className="slide-in-right absolute right-0 top-0 flex h-full w-[min(100%,470px)] flex-col overflow-y-auto bg-[#10241c] p-7 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
      >
        <header className="flex items-start justify-between border-b border-white/15 pb-5">
          <div>
            <small className="text-[10px] tracking-[0.2em] text-[#a2d8b4]">LETHARGIC GARDENS</small>
            <h2 id="lg-title" className="mt-2 font-serif text-4xl font-normal">
              Your basket
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label="Close basket"
            className="text-3xl leading-none text-white"
          >
            ×
          </button>
        </header>

        <div className="flex-1">
          {lines.length === 0 ? (
            <p className="py-6 leading-relaxed text-[#b2c5b8]">
              Your basket is empty. Take your time and find something to grow.
            </p>
          ) : (
            lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-3 border-b border-white/10 py-5">
                <div className="flex gap-3">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-white/5 text-2xl">
                    {l.emoji}
                  </span>
                  <div>
                    <strong className="font-medium">{l.name}</strong>
                    <p className="my-1 text-xs text-[#b2c5b8]">{money(l.priceCents)} each</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => setQty(l.id, l.quantity - 1)}
                        aria-label={`Remove one ${l.name}`}
                        className="h-7 w-7 rounded-full border border-white/25 hover:bg-white/10"
                      >
                        −
                      </button>
                      <span>{l.quantity}</span>
                      <button
                        onClick={() => setQty(l.id, l.quantity + 1)}
                        disabled={l.quantity >= l.max}
                        aria-label={`Add one ${l.name}`}
                        className="h-7 w-7 rounded-full border border-white/25 hover:bg-white/10 disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(l.id)}
                        className="text-xs text-[#b2c5b8] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                <b className="font-medium">{money(l.priceCents * l.quantity)}</b>
              </div>
            ))
          )}
        </div>

        <div className="pt-4">
          <div className="flex justify-between pt-4 text-lg">
            <span>Subtotal</span>
            <strong>{money(subtotalCents)}</strong>
          </div>
          {lines.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-[#b2c5b8]">
              {toFree > 0
                ? `Add ${money(toFree)} more for free shipping.`
                : "You have free shipping on this order."}{" "}
              Pickup is always free.
            </p>
          )}
          {lines.length > 0 ? (
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="mt-5 block w-full rounded-full bg-[#a7e8bb] p-3.5 text-center font-semibold text-[#10241c] transition hover:bg-[#bff3cf]"
            >
              Order online
            </Link>
          ) : (
            <button
              disabled
              className="mt-5 w-full rounded-full bg-[#a7e8bb] p-3.5 font-semibold text-[#10241c] opacity-50"
            >
              Order online
            </button>
          )}
          <p className="mt-3 text-xs leading-relaxed text-[#b2c5b8]">
            Orders go straight to our shop register. Pay at pickup or by invoice; no card is charged
            online.
          </p>
        </div>
      </section>
    </div>
  );
}
