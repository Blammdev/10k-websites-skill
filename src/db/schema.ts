import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull().default("seed"), // seed | merch
  category: text("category").notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🌱"),
  note: text("note").notNull().default(""),
  tag: text("tag").notNull().default(""),
  detail: text("detail").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  isHemp: boolean("is_hemp").notNull().default(false),
  posItemId: text("pos_item_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  source: text("source").notNull().default("online"), // online | pos
  status: text("status").notNull().default("new"), // new | preparing | ready | completed | cancelled
  fulfillment: text("fulfillment").notNull().default("pickup"), // pickup | shipping
  paymentMethod: text("payment_method").notNull().default("pay_in_store"),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | paid
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  shippingAddress: text("shipping_address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  posSyncStatus: text("pos_sync_status").notNull().default("pending"), // pending | synced | failed | not_applicable
  posOrderId: text("pos_order_id"),
  posSyncError: text("pos_sync_error"),
  posSyncedAt: timestamp("pos_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  sku: text("sku").notNull().default(""),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const posSettings = pgTable("pos_settings", {
  id: integer("id").primaryKey().default(1),
  provider: text("provider").notNull().default("simulator"), // simulator | square
  locationName: text("location_name").notNull().default("Lethargic Gardens Shop"),
  locationId: text("location_id").notNull().default(""),
  autoSync: boolean("auto_sync").notNull().default(true),
  syncInventory: boolean("sync_inventory").notNull().default(true),
  lastPushAt: timestamp("last_push_at"),
  lastPullAt: timestamp("last_pull_at"),
});

export const posSyncLog = pgTable("pos_sync_log", {
  id: serial("id").primaryKey(),
  direction: text("direction").notNull(), // push | pull | webhook
  kind: text("kind").notNull(), // order | inventory | sale
  ok: boolean("ok").notNull().default(true),
  message: text("message").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
