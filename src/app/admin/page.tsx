import type { Metadata } from "next";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";
import { ensureSeeded, getSettings, providerStatus, recentLog, webhookSecret } from "@/lib/pos";
import { AdminLogin, Dashboard } from "@/components/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff | Lethargic Gardens", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;

  await ensureSeeded();
  const [settings, orderRows, itemRows, productRows, log] = await Promise.all([
    getSettings(),
    db.select().from(orders).orderBy(desc(orders.id)).limit(100),
    db.select().from(orderItems),
    db.select().from(products).orderBy(asc(products.sortOrder)),
    recentLog(30),
  ]);

  const itemsByOrder = new Map<number, { name: string; quantity: number }[]>();
  for (const it of itemRows) {
    const l = itemsByOrder.get(it.orderId) ?? [];
    l.push({ name: it.name, quantity: it.quantity });
    itemsByOrder.set(it.orderId, l);
  }

  return (
    <Dashboard
      settings={{
        provider: settings.provider as "simulator" | "square",
        locationName: settings.locationName,
        locationId: settings.locationId,
        autoSync: settings.autoSync,
        syncInventory: settings.syncInventory,
        lastPushAt: settings.lastPushAt?.toISOString() ?? null,
        lastPullAt: settings.lastPullAt?.toISOString() ?? null,
      }}
      provider={providerStatus()}
      webhookSecret={webhookSecret()}
      secretIsDefault={!process.env.POS_WEBHOOK_SECRET}
      orders={orderRows.map((o) => ({
        id: o.id,
        code: o.code,
        source: o.source,
        status: o.status,
        fulfillment: o.fulfillment,
        paymentStatus: o.paymentStatus,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        totalCents: o.totalCents,
        posSyncStatus: o.posSyncStatus,
        posOrderId: o.posOrderId,
        posSyncError: o.posSyncError,
        createdAt: o.createdAt.toISOString(),
        items: itemsByOrder.get(o.id) ?? [],
      }))}
      products={productRows.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        kind: p.kind,
        category: p.category,
        priceCents: p.priceCents,
        stock: p.stock,
        active: p.active,
        posItemId: p.posItemId ?? "",
      }))}
      log={log.map((l) => ({
        id: l.id,
        direction: l.direction,
        kind: l.kind,
        ok: l.ok,
        message: l.message,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}
