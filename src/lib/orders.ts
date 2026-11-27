import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { FREE_SHIPPING_OVER_CENTS, SHIPPING_FLAT_CENTS } from "@/lib/catalog";
import { ensureSeeded, getSettings, syncOrder } from "@/lib/pos";

export type OrderInput = {
  items: { id: string; quantity: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fulfillment: "pickup" | "shipping";
  shippingAddress?: string;
  paymentMethod: "pay_in_store" | "invoice";
  notes?: string;
  hempConfirmed?: boolean;
};

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `LG-${s}`;
}

export function validateOrderInput(raw: unknown): OrderInput {
  const r = raw as Partial<OrderInput> | null;
  if (!r || typeof r !== "object") throw new OrderError("Invalid request");
  const name = String(r.customerName ?? "").trim();
  const email = String(r.customerEmail ?? "").trim();
  const phone = String(r.customerPhone ?? "").trim();
  if (name.length < 2) throw new OrderError("Please enter your name");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new OrderError("Please enter a valid email");
  const fulfillment = r.fulfillment === "shipping" ? "shipping" : "pickup";
  const address = String(r.shippingAddress ?? "").trim();
  if (fulfillment === "shipping" && address.length < 8) {
    throw new OrderError("Please enter a shipping address");
  }
  if (!Array.isArray(r.items) || r.items.length === 0) throw new OrderError("Your basket is empty");
  const merged = new Map<string, number>();
  for (const it of r.items) {
    const id = String(it?.id ?? "");
    const q = Math.floor(Number(it?.quantity));
    if (!id || !Number.isFinite(q) || q < 1 || q > 50) throw new OrderError("Invalid item quantity");
    merged.set(id, (merged.get(id) ?? 0) + q);
  }
  return {
    items: [...merged].map(([id, quantity]) => ({ id, quantity })),
    customerName: name.slice(0, 120),
    customerEmail: email.slice(0, 200),
    customerPhone: phone.slice(0, 40),
    fulfillment,
    shippingAddress: address.slice(0, 500),
    paymentMethod: r.paymentMethod === "invoice" ? "invoice" : "pay_in_store",
    notes: String(r.notes ?? "").slice(0, 1000),
    hempConfirmed: !!r.hempConfirmed,
  };
}

export async function createOrder(input: OrderInput) {
  await ensureSeeded();
  const ids = input.items.map((i) => i.id);

  const created = await db.transaction(async (tx) => {
    const rows = await tx.select().from(products).where(inArray(products.id, ids)).for("update");
    const byId = new Map(rows.map((p) => [p.id, p]));
    let subtotal = 0;
    let hasHemp = false;
    for (const it of input.items) {
      const p = byId.get(it.id);
      if (!p || !p.active) throw new OrderError("An item in your basket is no longer available");
      if (p.stock < it.quantity) {
        throw new OrderError(
          p.stock === 0
            ? `${p.name} is sold out`
            : `Only ${p.stock} of ${p.name} left in stock`,
          409,
        );
      }
      if (p.isHemp) hasHemp = true;
      subtotal += p.priceCents * it.quantity;
    }
    if (hasHemp && !input.hempConfirmed) {
      throw new OrderError("Please confirm hemp seeds are legal where you live");
    }
    const shipping =
      input.fulfillment === "shipping" && subtotal < FREE_SHIPPING_OVER_CENTS
        ? SHIPPING_FLAT_CENTS
        : 0;

    for (const it of input.items) {
      const p = byId.get(it.id)!;
      await tx
        .update(products)
        .set({ stock: p.stock - it.quantity, updatedAt: new Date() })
        .where(eq(products.id, p.id));
    }

    let code = newCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await tx.select({ id: orders.id }).from(orders).where(eq(orders.code, code));
      if (!clash.length) break;
      code = newCode();
    }

    const [order] = await tx
      .insert(orders)
      .values({
        code,
        source: "online",
        status: "new",
        fulfillment: input.fulfillment,
        paymentMethod: input.paymentMethod,
        paymentStatus: "unpaid",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone ?? "",
        shippingAddress: input.fulfillment === "shipping" ? input.shippingAddress ?? "" : "",
        notes: input.notes ?? "",
        subtotalCents: subtotal,
        shippingCents: shipping,
        totalCents: subtotal + shipping,
        posSyncStatus: "pending",
      })
      .returning();

    await tx.insert(orderItems).values(
      input.items.map((it) => {
        const p = byId.get(it.id)!;
        return {
          orderId: order.id,
          productId: p.id,
          name: p.name,
          sku: p.sku,
          unitPriceCents: p.priceCents,
          quantity: it.quantity,
        };
      }),
    );
    return order;
  });

  // Push to the POS right away when auto-sync is on. Failures never block the customer.
  const settings = await getSettings();
  if (settings.autoSync) {
    try {
      await syncOrder(created.id);
    } catch {
      /* logged inside syncOrder; order stays pending for retry */
    }
  }
  return created;
}

export async function setOrderStatus(orderId: number, status: string) {
  const allowed = ["new", "preparing", "ready", "completed", "cancelled"];
  if (!allowed.includes(status)) throw new OrderError("Invalid status");
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order) throw new OrderError("Order not found", 404);
    if (order.status === status) return;
    // Restock when cancelling an order that had reserved inventory.
    if (status === "cancelled" && order.source === "online") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const it of items) {
        const [p] = await tx.select().from(products).where(eq(products.id, it.productId));
        if (p) {
          await tx
            .update(products)
            .set({ stock: p.stock + it.quantity, updatedAt: new Date() })
            .where(eq(products.id, p.id));
        }
      }
    }
    await tx
      .update(orders)
      .set({
        status,
        paymentStatus: status === "completed" ? "paid" : order.paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
}

export async function getOrderByCode(code: string) {
  const [order] = await db.select().from(orders).where(eq(orders.code, code));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
