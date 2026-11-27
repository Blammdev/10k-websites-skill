"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/catalog";

type Settings = {
  provider: "simulator" | "square";
  locationName: string;
  locationId: string;
  autoSync: boolean;
  syncInventory: boolean;
  lastPushAt: string | null;
  lastPullAt: string | null;
};
type OrderRow = {
  id: number;
  code: string;
  source: string;
  status: string;
  fulfillment: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  posSyncStatus: string;
  posOrderId: string | null;
  posSyncError: string | null;
  createdAt: string;
  items: { name: string; quantity: number }[];
};
type ProductRow = {
  id: string;
  name: string;
  sku: string;
  kind: string;
  category: string;
  priceCents: number;
  stock: number;
  active: boolean;
  posItemId: string;
};
type LogRow = { id: number; direction: string; kind: string; ok: boolean; message: string; createdAt: string };

const input =
  "rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-300/60";
const btn =
  "rounded-full bg-emerald-300 px-5 py-2 text-sm font-medium text-black transition hover:bg-emerald-200 disabled:opacity-50";
const btnGhost =
  "rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/50 disabled:opacity-50";

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const r = await call("/api/admin/login", "POST", { password: pw });
          if (r.ok) router.refresh();
          else {
            setErr(r.data.error || "Could not sign in");
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-moss p-8"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Staff only</p>
        <h1 className="mt-3 font-display text-4xl font-light text-white">Back of house</h1>
        <input
          type="password"
          autoFocus
          required
          placeholder="Admin password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className={`${input} mt-6 w-full`}
        />
        {err && <p role="alert" className="mt-3 text-sm text-rose-300">{err}</p>}
        <button disabled={busy} className={`${btn} mt-5 w-full`}>Sign in</button>
        <Link href="/" className="mt-4 block text-center text-xs text-white/40 hover:text-white/70">← Back to the shop</Link>
      </form>
    </main>
  );
}

const STATUS_STYLE: Record<string, string> = {
  new: "bg-sky-400/15 text-sky-200",
  preparing: "bg-amber-300/15 text-amber-200",
  ready: "bg-emerald-300/15 text-emerald-200",
  completed: "bg-white/10 text-white/70",
  cancelled: "bg-rose-400/15 text-rose-200",
};
const SYNC_STYLE: Record<string, string> = {
  synced: "bg-emerald-300/15 text-emerald-200",
  pending: "bg-amber-300/15 text-amber-200",
  failed: "bg-rose-400/15 text-rose-200",
  not_applicable: "bg-white/10 text-white/60",
};

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function Dashboard(props: {
  settings: Settings;
  provider: { squareConfigured: boolean; squareEnv: string };
  webhookSecret: string;
  secretIsDefault: boolean;
  orders: OrderRow[];
  products: ProductRow[];
  log: LogRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "pos" | "inventory">("orders");
  const [flash, setFlash] = useState("");
  const [busy, setBusy] = useState(false);

  const online = props.orders.filter((o) => o.source === "online");
  const stats = [
    { label: "Open orders", value: online.filter((o) => ["new", "preparing", "ready"].includes(o.status)).length },
    { label: "Awaiting POS sync", value: online.filter((o) => o.posSyncStatus === "pending").length },
    { label: "Sync failures", value: online.filter((o) => o.posSyncStatus === "failed").length },
    { label: "Low / out of stock", value: props.products.filter((p) => p.active && p.stock <= 5).length },
  ];

  const run = async (fn: () => Promise<string | void>) => {
    setBusy(true);
    try {
      const msg = await fn();
      if (msg) setFlash(msg);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-white/40 hover:text-white/70">← Lethargic Gardens</Link>
          <h1 className="mt-1 font-display text-4xl font-light text-white">Shop &amp; POS control</h1>
        </div>
        <button
          className={btnGhost}
          onClick={async () => {
            await call("/api/admin/login", "DELETE");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-moss p-5">
            <p className="font-display text-4xl text-white">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      <nav className="mt-8 flex gap-2 border-b border-white/10 pb-3" aria-label="Sections">
        {(
          [
            ["orders", "Orders"],
            ["pos", "POS sync"],
            ["inventory", "Inventory"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === k ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
          >
            {l}
          </button>
        ))}
      </nav>

      {flash && (
        <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {flash}
        </p>
      )}

      {tab === "orders" && (
        <section className="mt-6 space-y-3">
          {props.orders.length === 0 && <p className="py-10 text-center text-white/50">No orders yet.</p>}
          {props.orders.map((o) => (
            <article key={o.id} className="rounded-2xl border border-white/10 bg-moss p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/order/${o.code}`} className="font-medium text-white underline-offset-4 hover:underline">
                      {o.code}
                    </Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${o.source === "pos" ? "bg-violet-400/15 text-violet-200" : "bg-white/10 text-white/70"}`}>
                      {o.source === "pos" ? "In store" : o.fulfillment}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${SYNC_STYLE[o.posSyncStatus] ?? ""}`}>
                      POS {o.posSyncStatus.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    {o.customerName}
                    {o.customerEmail && <span className="text-white/40"> · {o.customerEmail}</span>}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </p>
                  {o.posOrderId && <p className="mt-1 text-xs text-white/35">POS id {o.posOrderId}</p>}
                  {o.posSyncError && <p className="mt-1 text-xs text-rose-300">{o.posSyncError}</p>}
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-white">{money(o.totalCents)}</p>
                  <p className="text-xs text-white/40">{fmt(o.createdAt)} · {o.paymentStatus}</p>
                </div>
              </div>
              {o.source === "online" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Status for ${o.code}`}
                    value={o.status}
                    disabled={busy}
                    onChange={(e) =>
                      run(async () => {
                        const r = await call(`/api/admin/orders/${o.id}`, "PATCH", { status: e.target.value });
                        return r.ok ? `${o.code} marked ${e.target.value}` : r.data.error;
                      })
                    }
                    className={input}
                  >
                    {["new", "preparing", "ready", "completed", "cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {o.posSyncStatus !== "synced" && (
                    <button
                      className={btnGhost}
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const r = await call(`/api/admin/orders/${o.id}`, "PATCH", { action: "sync" });
                          return r.ok ? `${o.code} synced to POS` : `Sync failed: ${r.data.error ?? "unknown error"}`;
                        })
                      }
                    >
                      Sync to POS
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {tab === "pos" && <PosPanel {...props} busy={busy} run={run} />}
      {tab === "inventory" && <InventoryPanel products={props.products} busy={busy} run={run} />}
    </main>
  );
}

type Run = (fn: () => Promise<string | void>) => Promise<void>;

function PosPanel({
  settings,
  provider,
  webhookSecret,
  secretIsDefault,
  products,
  log,
  busy,
  run,
}: {
  settings: Settings;
  provider: { squareConfigured: boolean; squareEnv: string };
  webhookSecret: string;
  secretIsDefault: boolean;
  products: ProductRow[];
  log: LogRow[];
  busy: boolean;
  run: Run;
}) {
  const [s, setS] = useState(settings);
  const [simProduct, setSimProduct] = useState(products[0]?.sku ?? "");
  const [simQty, setSimQty] = useState(1);

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-moss p-6">
          <h2 className="font-display text-2xl text-white">Connection</h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1 text-sm text-white/60">
              Provider
              <select className={input} value={s.provider} onChange={(e) => setS({ ...s, provider: e.target.value as Settings["provider"] })}>
                <option value="simulator">Built-in POS simulator</option>
                <option value="square">Square (Orders API)</option>
              </select>
            </label>
            {s.provider === "square" && (
              <p className={`rounded-xl px-4 py-3 text-xs ${provider.squareConfigured ? "bg-emerald-300/10 text-emerald-100" : "bg-amber-300/10 text-amber-100"}`}>
                {provider.squareConfigured
                  ? `SQUARE_ACCESS_TOKEN detected · ${provider.squareEnv} environment.`
                  : "Set SQUARE_ACCESS_TOKEN (and SQUARE_ENV=production for live) in the server environment to enable Square."}
              </p>
            )}
            <label className="grid gap-1 text-sm text-white/60">
              Location name
              <input className={input} value={s.locationName} onChange={(e) => setS({ ...s, locationName: e.target.value })} />
            </label>
            {s.provider === "square" && (
              <label className="grid gap-1 text-sm text-white/60">
                Square location ID
                <input className={input} value={s.locationId} onChange={(e) => setS({ ...s, locationId: e.target.value })} placeholder="L8XXXXXXXXXX" />
              </label>
            )}
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input type="checkbox" className="accent-emerald-300" checked={s.autoSync} onChange={(e) => setS({ ...s, autoSync: e.target.checked })} />
              Send new online orders to the POS automatically
            </label>
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input type="checkbox" className="accent-emerald-300" checked={s.syncInventory} onChange={(e) => setS({ ...s, syncInventory: e.target.checked })} />
              Keep stock counts in sync with the POS
            </label>
            <div>
              <button
                className={btn}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const r = await call("/api/admin/pos", "PUT", s);
                    return r.ok ? "POS settings saved" : r.data.error;
                  })
                }
              >
                Save settings
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-moss p-6">
          <h2 className="font-display text-2xl text-white">Sync now</h2>
          <p className="mt-2 text-sm text-white/50">
            Last push {settings.lastPushAt ? fmt(settings.lastPushAt) : "never"} · last pull {settings.lastPullAt ? fmt(settings.lastPullAt) : "never"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className={btn}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const r = await call("/api/admin/pos", "POST", { action: "push" });
                  const d = r.data as { total: number; synced: number; failed: number };
                  return d.total === 0 ? "Nothing waiting to sync" : `Pushed ${d.synced} of ${d.total} orders (${d.failed} failed)`;
                })
              }
            >
              Push pending orders
            </button>
            <button
              className={btnGhost}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const r = await call("/api/admin/pos", "POST", { action: "pull" });
                  return (r.data as { message: string }).message;
                })
              }
            >
              Pull inventory
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-moss p-6">
          <h2 className="font-display text-2xl text-white">Inbound webhook</h2>
          <p className="mt-2 text-sm text-white/50">Point your POS at this endpoint to push in-store sales and stock changes.</p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-black/50 p-4 text-xs leading-relaxed text-emerald-100">{`POST /api/pos/webhook
x-pos-secret: ${webhookSecret}

{ "type": "sale.completed",
  "reference": "R-1042",
  "items": [{ "sku": "LG-HP1", "quantity": 2 }] }

{ "type": "inventory.updated",
  "sku": "LG-MC1", "quantity": 12 }`}</pre>
          {secretIsDefault && (
            <p className="mt-3 text-xs text-amber-200">Using the demo secret. Set POS_WEBHOOK_SECRET in production.</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-moss p-6">
          <h2 className="font-display text-2xl text-white">POS simulator</h2>
          <p className="mt-2 text-sm text-white/50">Fire the same events your register would send, to see stock and orders update.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-xs text-white/50">
              Item
              <select className={input} value={simProduct} onChange={(e) => setSimProduct(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>{p.name} ({p.stock})</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs text-white/50">
              Qty
              <input type="number" min={0} className={`${input} w-20`} value={simQty} onChange={(e) => setSimQty(Number(e.target.value))} />
            </label>
            <button
              className={btn}
              disabled={busy || simQty < 1}
              onClick={() =>
                run(async () => {
                  const r = await call("/api/admin/pos", "POST", {
                    action: "simulate",
                    event: { type: "sale.completed", reference: `SIM-${Date.now().toString().slice(-6)}`, items: [{ sku: simProduct, quantity: simQty }] },
                  });
                  return r.ok ? "In-store sale recorded and stock reduced" : r.data.error;
                })
              }
            >
              In-store sale
            </button>
            <button
              className={btnGhost}
              disabled={busy || simQty < 0}
              onClick={() =>
                run(async () => {
                  const r = await call("/api/admin/pos", "POST", {
                    action: "simulate",
                    event: { type: "inventory.updated", sku: simProduct, quantity: simQty },
                  });
                  return r.ok ? "Stock set from POS" : r.data.error;
                })
              }
            >
              Set stock to qty
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-moss p-6">
          <h2 className="font-display text-2xl text-white">Sync log</h2>
          <ul className="mt-4 divide-y divide-white/10">
            {log.length === 0 && <li className="py-3 text-sm text-white/40">No activity yet.</li>}
            {log.map((l) => (
              <li key={l.id} className="flex gap-3 py-3 text-sm">
                <span className={`mt-1 h-2 w-2 flex-none rounded-full ${l.ok ? "bg-emerald-300" : "bg-rose-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-white/80">{l.message}</p>
                  <p className="text-xs text-white/35">{l.direction} · {l.kind} · {fmt(l.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function InventoryPanel({ products, busy, run }: { products: ProductRow[]; busy: boolean; run: Run }) {
  const [edits, setEdits] = useState<Record<string, Partial<ProductRow>>>({});
  const val = <K extends keyof ProductRow>(p: ProductRow, k: K): ProductRow[K] =>
    (edits[p.id]?.[k] ?? p[k]) as ProductRow[K];
  const change = (id: string, patch: Partial<ProductRow>) =>
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  return (
    <section className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-moss">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-white/40">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">POS item ID</th>
            <th className="px-4 py-3">Live</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((p) => {
            const dirty = !!edits[p.id];
            return (
              <tr key={p.id}>
                <td className="px-4 py-2 text-white">
                  {p.name}
                  <span className="ml-2 text-xs text-white/35">{p.kind === "merch" ? "merch" : p.category}</span>
                </td>
                <td className="px-4 py-2 text-white/50">{p.sku}</td>
                <td className="px-4 py-2 text-white/70">{money(p.priceCents)}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    aria-label={`Stock for ${p.name}`}
                    className={`${input} w-20 ${val(p, "stock") <= 5 ? "border-amber-300/50" : ""}`}
                    value={val(p, "stock")}
                    onChange={(e) => change(p.id, { stock: Number(e.target.value) })}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    aria-label={`POS item ID for ${p.name}`}
                    className={`${input} w-40`}
                    placeholder="Square variation ID"
                    value={val(p, "posItemId")}
                    onChange={(e) => change(p.id, { posItemId: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    aria-label={`${p.name} visible in shop`}
                    className="accent-emerald-300"
                    checked={val(p, "active")}
                    onChange={(e) => change(p.id, { active: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  {dirty && (
                    <button
                      className={btn}
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const e = edits[p.id];
                          const r = await call(`/api/admin/products/${p.id}`, "PATCH", {
                            stock: e.stock,
                            posItemId: e.posItemId,
                            active: e.active,
                          });
                          setEdits((all) => {
                            const n = { ...all };
                            delete n[p.id];
                            return n;
                          });
                          return r.ok ? `${p.name} updated` : r.data.error;
                        })
                      }
                    >
                      Save
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
