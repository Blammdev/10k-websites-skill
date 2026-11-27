import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/orders";
import { money } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

const STEPS = [
  ["new", "Received"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["completed", "Completed"],
] as const;

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!found) notFound();
  const { order, items } = found;
  const cancelled = order.status === "cancelled";
  const stepIdx = STEPS.findIndex(([s]) => s === order.status);

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Order {order.code}</p>
        <h1 className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
          {cancelled ? (
            "Order cancelled."
          ) : (
            <>
              Thank you, <em className="text-emerald-300">{order.customerName.split(" ")[0]}.</em>
            </>
          )}
        </h1>
        <p className="mt-4 text-white/60">
          {cancelled
            ? "This order was cancelled and the items went back on the shelf."
            : order.fulfillment === "pickup"
              ? "Your order has been sent to the shop register. We will email you when it is ready for pickup."
              : "Your order has been sent to the shop register. We will email you when it ships."}{" "}
          Save this page; the link is your order tracker.
        </p>

        {!cancelled && (
          <ol className="mt-10 grid grid-cols-4 gap-2">
            {STEPS.map(([s, label], i) => (
              <li key={s} className="text-center">
                <div className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-emerald-300" : "bg-white/10"}`} />
                <span className={`mt-2 block text-xs ${i <= stepIdx ? "text-emerald-200" : "text-white/40"}`}>{label}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 rounded-3xl border border-white/10 bg-moss p-6">
          <ul className="divide-y divide-white/10">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between py-3 text-sm">
                <span className="text-white">
                  {it.name} <span className="text-white/40">× {it.quantity}</span>
                </span>
                <span className="text-white/80">{money(it.unitPriceCents * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-white/60"><dt>Subtotal</dt><dd>{money(order.subtotalCents)}</dd></div>
            <div className="flex justify-between text-white/60"><dt>Shipping</dt><dd>{order.shippingCents ? money(order.shippingCents) : "Free"}</dd></div>
            <div className="flex justify-between pt-2 text-lg text-white"><dt>Total</dt><dd>{money(order.totalCents)}</dd></div>
          </dl>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-white/60 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">Fulfillment</p>
            <p className="mt-2 text-white">{order.fulfillment === "pickup" ? "Pickup in store" : "Shipping"}</p>
            {order.shippingAddress && <p className="mt-1 whitespace-pre-line">{order.shippingAddress}</p>}
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">Payment</p>
            <p className="mt-2 text-white">
              {order.paymentMethod === "invoice" ? "Invoice by email" : "Pay at pickup / delivery"} ·{" "}
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Link href="/" className="rounded-full bg-emerald-300 px-6 py-2.5 text-sm font-medium text-black">Keep browsing</Link>
          <Link href="/merch" className="rounded-full border border-amber-200/40 px-6 py-2.5 text-sm text-amber-100">Shop merch</Link>
        </div>
      </main>
    </div>
  );
}
