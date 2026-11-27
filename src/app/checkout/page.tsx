"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { SiteHeader } from "@/components/site-header";
import { FREE_SHIPPING_OVER_CENTS, SHIPPING_FLAT_CENTS, money } from "@/lib/catalog";

const field =
  "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-300/60";

export default function CheckoutPage() {
  const { lines, subtotalCents, clear, setQty, remove } = useCart();
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping">("pickup");
  const [payment, setPayment] = useState<"pay_in_store" | "invoice">("pay_in_store");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [hemp, setHemp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasHemp = lines.some((l) => l.isHemp);
  const shipping =
    fulfillment === "shipping" && subtotalCents < FREE_SHIPPING_OVER_CENTS ? SHIPPING_FLAT_CENTS : 0;
  const total = subtotalCents + shipping;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          fulfillment,
          shippingAddress: form.address,
          paymentMethod: payment,
          notes: form.notes,
          hempConfirmed: hemp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order");
      clear();
      router.push(`/order/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Online ordering</p>
        <h1 className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
          Place your <em className="text-emerald-300">order.</em>
        </h1>

        {lines.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 p-10 text-center">
            <p className="text-white/60">Your basket is empty. Take your time and find something to grow.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/#houseplants" className="rounded-full bg-emerald-300 px-6 py-2.5 text-sm font-medium text-black">
                Browse seeds
              </Link>
              <Link href="/merch" className="rounded-full border border-amber-200/40 px-6 py-2.5 text-sm text-amber-100">
                Shop merch
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <fieldset className="space-y-4">
                <legend className="mb-2 font-display text-2xl text-white">Your details</legend>
                <input required placeholder="Full name" className={field} value={form.name} onChange={set("name")} autoComplete="name" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required type="email" placeholder="Email" className={field} value={form.email} onChange={set("email")} autoComplete="email" />
                  <input type="tel" placeholder="Phone (optional)" className={field} value={form.phone} onChange={set("phone")} autoComplete="tel" />
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-display text-2xl text-white">Fulfillment</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["pickup", "Pick up in store", "Free · ready when we text you"],
                      ["shipping", "Ship to me", `${money(SHIPPING_FLAT_CENTS)} · free over ${money(FREE_SHIPPING_OVER_CENTS)}`],
                    ] as const
                  ).map(([v, t, d]) => (
                    <label
                      key={v}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        fulfillment === v ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <input type="radio" name="f" className="sr-only" checked={fulfillment === v} onChange={() => setFulfillment(v)} />
                      <span className="block text-white">{t}</span>
                      <span className="mt-1 block text-xs text-white/50">{d}</span>
                    </label>
                  ))}
                </div>
                {fulfillment === "shipping" && (
                  <textarea
                    required
                    rows={3}
                    placeholder="Shipping address"
                    className={`${field} mt-4`}
                    value={form.address}
                    onChange={set("address")}
                    autoComplete="street-address"
                  />
                )}
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-display text-2xl text-white">Payment</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["pay_in_store", "Pay at pickup / delivery", "Settled at the register"],
                      ["invoice", "Email me an invoice", "We send a payment link"],
                    ] as const
                  ).map(([v, t, d]) => (
                    <label
                      key={v}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        payment === v ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <input type="radio" name="p" className="sr-only" checked={payment === v} onChange={() => setPayment(v)} />
                      <span className="block text-white">{t}</span>
                      <span className="mt-1 block text-xs text-white/50">{d}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/40">No card is charged online. Your order is confirmed once the shop accepts it.</p>
              </fieldset>

              <textarea rows={2} placeholder="Order notes (optional)" className={field} value={form.notes} onChange={set("notes")} />

              {hasHemp && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/5 p-4 text-sm text-lime-100/80">
                  <input type="checkbox" checked={hemp} onChange={(e) => setHemp(e.target.checked)} className="mt-1 accent-lime-300" required />
                  <span>I confirm that hemp seeds are legal where I live and I am of legal age to purchase them.</span>
                </label>
              )}
            </div>

            <aside className="h-fit rounded-3xl border border-white/10 bg-moss p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-2xl text-white">Summary</h2>
              <ul className="mt-4 divide-y divide-white/10">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                    <div className="flex gap-3">
                      <span className="text-2xl">{l.emoji}</span>
                      <div>
                        <p className="text-white">{l.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-white/50">
                          <button type="button" aria-label={`Remove one ${l.name}`} onClick={() => setQty(l.id, l.quantity - 1)} className="h-6 w-6 rounded-full border border-white/20">−</button>
                          <span>{l.quantity}</span>
                          <button type="button" aria-label={`Add one ${l.name}`} disabled={l.quantity >= l.max} onClick={() => setQty(l.id, l.quantity + 1)} className="h-6 w-6 rounded-full border border-white/20 disabled:opacity-40">+</button>
                          <button type="button" onClick={() => remove(l.id)} className="ml-1 text-xs underline">Remove</button>
                        </div>
                      </div>
                    </div>
                    <span className="text-white">{money(l.priceCents * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-white/60"><dt>Subtotal</dt><dd>{money(subtotalCents)}</dd></div>
                <div className="flex justify-between text-white/60"><dt>Shipping</dt><dd>{shipping ? money(shipping) : "Free"}</dd></div>
                <div className="flex justify-between pt-2 text-lg text-white"><dt>Total</dt><dd>{money(total)}</dd></div>
              </dl>
              {error && <p role="alert" className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
              <button
                disabled={busy}
                className="mt-5 w-full rounded-full bg-emerald-300 px-6 py-3.5 font-medium text-black transition hover:bg-emerald-200 disabled:opacity-60"
              >
                {busy ? "Sending to the shop…" : `Place order · ${money(total)}`}
              </button>
              <p className="mt-3 text-center text-xs text-white/40">Tax, if any, is confirmed at pickup or on your invoice.</p>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
