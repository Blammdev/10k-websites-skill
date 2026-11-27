import { randomUUID } from "node:crypto";
import { desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orders,
  posSettings,
  posSyncLog,
  products,
} from "@/db/schema";
import { SEED_PRODUCTS } from "@/lib/catalog";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;
type Settings = typeof posSettings.$inferSelect;

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

let seedPromise: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(products);
      if (count === 0) {
        await db.insert(products).values(SEED_PRODUCTS).onConflictDoNothing();
      } else {
        // Make sure newly added catalog items (e.g. merch) exist on older databases.
        const existing = await db.select({ id: products.id }).from(products);
        const have = new Set(existing.map((e) => e.id));
        const missing = SEED_PRODUCTS.filter((p) => !have.has(p.id));
        if (missing.length) {
          await db.insert(products).values(missing).onConflictDoNothing();
        }
      }
      await db.insert(posSettings).values({ id: 1 }).onConflictDoNothing();
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

export async function getSettings(): Promise<Settings> {
  await ensureSeeded();
  const [row] = await db.select().from(posSettings).where(eq(posSettings.id, 1));
  return row;
}

export async function logSync(entry: {
  direction: "push" | "pull" | "webhook";
  kind: "order" | "inventory" | "sale";
  ok: boolean;
  message: string;
  payload?: unknown;
}) {
  await db.insert(posSyncLog).values({
    direction: entry.direction,
    kind: entry.kind,
    ok: entry.ok,
    message: entry.message,
    payload: (entry.payload ?? null) as never,
  });
}

export function providerStatus() {
  const hasSquare = !!process.env.SQUARE_ACCESS_TOKEN;
  return {
    squareConfigured: hasSquare,
    squareEnv: process.env.SQUARE_ENV === "production" ? "production" : "sandbox",
  };
}

export function webhookSecret() {
  return process.env.POS_WEBHOOK_SECRET || "lethargic-pos-demo";
}

/* ------------------------------------------------------------------ */
/* Provider adapters                                                   */
/* ------------------------------------------------------------------ */

type PushResult = { ok: true; posOrderId: string } | { ok: false; error: string };

function squareBase() {
  return process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function squareHeaders() {
  return {
    "Content-Type": "application/json",
    "Square-Version": "2024-10-17",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  };
}

async function pushToProvider(
  settings: Settings,
  order: Order,
  items: OrderItem[],
): Promise<PushResult> {
  if (settings.provider === "square") {
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return { ok: false, error: "SQUARE_ACCESS_TOKEN is not set on the server" };
    }
    if (!settings.locationId) {
      return { ok: false, error: "Square location ID is missing in POS settings" };
    }
    try {
      const res = await fetch(`${squareBase()}/v2/orders`, {
        method: "POST",
        headers: squareHeaders(),
        body: JSON.stringify({
          idempotency_key: `lg-${order.code}`,
          order: {
            location_id: settings.locationId,
            reference_id: order.code,
            source: { name: "Lethargic Gardens Online" },
            line_items: items.map((i) => ({
              name: i.name,
              quantity: String(i.quantity),
              note: i.sku ? `SKU ${i.sku}` : undefined,
              base_price_money: { amount: i.unitPriceCents, currency: "USD" },
            })),
            ...(order.shippingCents > 0
              ? {
                  service_charges: [
                    {
                      name: "Shipping",
                      amount_money: { amount: order.shippingCents, currency: "USD" },
                      calculation_phase: "TOTAL_PHASE",
                    },
                  ],
                }
              : {}),
            fulfillments: [
              {
                type: order.fulfillment === "pickup" ? "PICKUP" : "SHIPMENT",
                state: "PROPOSED",
                ...(order.fulfillment === "pickup"
                  ? {
                      pickup_details: {
                        recipient: {
                          display_name: order.customerName,
                          email_address: order.customerEmail || undefined,
                          phone_number: order.customerPhone || undefined,
                        },
                        schedule_type: "ASAP",
                      },
                    }
                  : {
                      shipment_details: {
                        recipient: {
                          display_name: order.customerName,
                          email_address: order.customerEmail || undefined,
                          phone_number: order.customerPhone || undefined,
                        },
                      },
                    }),
              },
            ],
          },
        }),
      });
      const json = (await res.json()) as {
        order?: { id: string };
        errors?: { detail?: string }[];
      };
      if (!res.ok || !json.order) {
        return {
          ok: false,
          error: json.errors?.[0]?.detail || `Square responded ${res.status}`,
        };
      }
      return { ok: true, posOrderId: json.order.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Square request failed" };
    }
  }

  // Built-in simulator: behaves like a POS that always accepts the ticket.
  return { ok: true, posOrderId: `SIM-${order.code}-${randomUUID().slice(0, 4)}` };
}

/* ------------------------------------------------------------------ */
/* Outbound: push online orders to the POS                             */
/* ------------------------------------------------------------------ */

export async function syncOrder(orderId: number) {
  const settings = await getSettings();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return { ok: false as const, error: "Order not found" };
  if (order.source === "pos") return { ok: true as const, posOrderId: order.posOrderId ?? "" };
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  const result = await pushToProvider(settings, order, items);
  if (result.ok) {
    await db
      .update(orders)
      .set({
        posSyncStatus: "synced",
        posOrderId: result.posOrderId,
        posSyncError: null,
        posSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    await db.update(posSettings).set({ lastPushAt: new Date() }).where(eq(posSettings.id, 1));
    await logSync({
      direction: "push",
      kind: "order",
      ok: true,
      message: `Order ${order.code} sent to ${settings.provider} as ${result.posOrderId}`,
      payload: { code: order.code, total: order.totalCents, items: items.length },
    });
  } else {
    await db
      .update(orders)
      .set({ posSyncStatus: "failed", posSyncError: result.error, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await logSync({
      direction: "push",
      kind: "order",
      ok: false,
      message: `Order ${order.code} failed to sync: ${result.error}`,
    });
  }
  return result;
}

export async function syncPendingOrders() {
  const pending = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      or(eq(orders.posSyncStatus, "pending"), eq(orders.posSyncStatus, "failed")),
    )
    .orderBy(orders.id);
  let synced = 0;
  let failed = 0;
  for (const p of pending) {
    const r = await syncOrder(p.id);
    if (r.ok) synced++;
    else failed++;
  }
  return { total: pending.length, synced, failed };
}

/* ------------------------------------------------------------------ */
/* Inbound: pull inventory counts from the POS                         */
/* ------------------------------------------------------------------ */

export async function pullInventory() {
  const settings = await getSettings();

  if (!settings.syncInventory) {
    const msg = "Inventory sync is turned off in POS settings";
    await logSync({ direction: "pull", kind: "inventory", ok: false, message: msg });
    return { ok: false, updated: 0, message: msg };
  }

  if (settings.provider !== "square") {
    const msg =
      "Simulator mode: the POS pushes inventory to this site through the webhook. Use the simulator below, or switch to Square.";
    await logSync({ direction: "pull", kind: "inventory", ok: true, message: msg });
    return { ok: true, updated: 0, message: msg };
  }
  if (!process.env.SQUARE_ACCESS_TOKEN || !settings.locationId) {
    const msg = "Square access token or location ID is missing";
    await logSync({ direction: "pull", kind: "inventory", ok: false, message: msg });
    return { ok: false, updated: 0, message: msg };
  }

  const mapped = await db.select().from(products);
  const withIds = mapped.filter((p) => p.posItemId);
  if (!withIds.length) {
    const msg = "No products have a POS item ID mapped yet";
    await logSync({ direction: "pull", kind: "inventory", ok: false, message: msg });
    return { ok: false, updated: 0, message: msg };
  }

  try {
    const res = await fetch(`${squareBase()}/v2/inventory/counts/batch-retrieve`, {
      method: "POST",
      headers: squareHeaders(),
      body: JSON.stringify({
        catalog_object_ids: withIds.map((p) => p.posItemId),
        location_ids: [settings.locationId],
        states: ["IN_STOCK"],
      }),
    });
    const json = (await res.json()) as {
      counts?: { catalog_object_id: string; quantity: string }[];
      errors?: { detail?: string }[];
    };
    if (!res.ok) throw new Error(json.errors?.[0]?.detail || `Square responded ${res.status}`);
    let updated = 0;
    for (const c of json.counts ?? []) {
      const p = withIds.find((x) => x.posItemId === c.catalog_object_id);
      if (!p) continue;
      await db
        .update(products)
        .set({ stock: Math.max(0, Math.floor(Number(c.quantity) || 0)), updatedAt: new Date() })
        .where(eq(products.id, p.id));
      updated++;
    }
    await db.update(posSettings).set({ lastPullAt: new Date() }).where(eq(posSettings.id, 1));
    const msg = `Pulled ${updated} inventory counts from Square`;
    await logSync({ direction: "pull", kind: "inventory", ok: true, message: msg });
    return { ok: true, updated, message: msg };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Inventory pull failed";
    await logSync({ direction: "pull", kind: "inventory", ok: false, message: msg });
    return { ok: false, updated: 0, message: msg };
  }
}

/* ------------------------------------------------------------------ */
/* Inbound: webhook events from the POS                                */
/* ------------------------------------------------------------------ */

export type PosEvent =
  | {
      type: "sale.completed";
      reference?: string;
      items: { sku?: string; productId?: string; quantity: number }[];
    }
  | { type: "inventory.updated"; sku?: string; productId?: string; quantity: number };

async function findProducts(refs: { sku?: string; productId?: string }[]) {
  const ids = refs.map((r) => r.productId).filter(Boolean) as string[];
  const skus = refs.map((r) => r.sku).filter(Boolean) as string[];
  if (!ids.length && !skus.length) return [];
  const conds = [];
  if (ids.length) conds.push(inArray(products.id, ids));
  if (skus.length) conds.push(inArray(products.sku, skus));
  return db.select().from(products).where(or(...conds));
}

export async function applyPosEvent(event: PosEvent) {
  await ensureSeeded();

  if (event.type === "inventory.updated") {
    const settings = await getSettings();
    if (!settings.syncInventory) {
      const msg = "Inventory update ignored because inventory sync is turned off";
      await logSync({ direction: "webhook", kind: "inventory", ok: false, message: msg, payload: event });
      return { ok: false as const, error: msg };
    }
    const [p] = await findProducts([event]);
    if (!p) {
      const msg = `Inventory event for unknown item ${event.sku ?? event.productId}`;
      await logSync({ direction: "webhook", kind: "inventory", ok: false, message: msg });
      return { ok: false as const, error: msg };
    }
    const qty = Math.max(0, Math.floor(event.quantity));
    await db.update(products).set({ stock: qty, updatedAt: new Date() }).where(eq(products.id, p.id));
    await logSync({
      direction: "webhook",
      kind: "inventory",
      ok: true,
      message: `${p.name} stock set to ${qty} by POS`,
      payload: event,
    });
    return { ok: true as const };
  }

  if (event.type === "sale.completed") {
    const refs = event.items;
    const found = await findProducts(refs);
    const lines: { p: (typeof found)[number]; qty: number }[] = [];
    for (const r of refs) {
      const p = found.find((f) => f.id === r.productId || (r.sku && f.sku === r.sku));
      const qty = Math.floor(Number(r.quantity));
      if (p && qty > 0) lines.push({ p, qty });
    }
    if (!lines.length) {
      const msg = "In-store sale had no recognisable items";
      await logSync({ direction: "webhook", kind: "sale", ok: false, message: msg, payload: event });
      return { ok: false as const, error: msg };
    }
    const subtotal = lines.reduce((s, l) => s + l.p.priceCents * l.qty, 0);
    const code = `POS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await db.transaction(async (tx) => {
      for (const l of lines) {
        await tx
          .update(products)
          .set({
            stock: sql`greatest(${products.stock} - ${l.qty}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, l.p.id));
      }
      const [o] = await tx
        .insert(orders)
        .values({
          code,
          source: "pos",
          status: "completed",
          fulfillment: "pickup",
          paymentMethod: "in_store",
          paymentStatus: "paid",
          customerName: "In-store customer",
          notes: event.reference ? `POS ref ${event.reference}` : "",
          subtotalCents: subtotal,
          totalCents: subtotal,
          posSyncStatus: "synced",
          posOrderId: event.reference ?? code,
          posSyncedAt: new Date(),
        })
        .returning({ id: orders.id });
      await tx.insert(orderItems).values(
        lines.map((l) => ({
          orderId: o.id,
          productId: l.p.id,
          name: l.p.name,
          sku: l.p.sku,
          unitPriceCents: l.p.priceCents,
          quantity: l.qty,
        })),
      );
    });
    await logSync({
      direction: "webhook",
      kind: "sale",
      ok: true,
      message: `In-store sale ${code}: ${lines.map((l) => `${l.p.name} × ${l.qty}`).join(", ")}`,
      payload: event,
    });
    return { ok: true as const, code };
  }

  return { ok: false as const, error: "Unsupported event type" };
}

export async function recentLog(limit = 25) {
  return db.select().from(posSyncLog).orderBy(desc(posSyncLog.id)).limit(limit);
}
