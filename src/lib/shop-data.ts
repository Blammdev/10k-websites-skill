import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/pos";
import type { ShopProduct } from "@/components/shop";

export async function loadShop() {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder));
  const byCategory = new Map<string, ShopProduct[]>();
  for (const p of rows) {
    const list = byCategory.get(p.category) ?? [];
    list.push({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      note: p.note,
      tag: p.tag,
      detail: p.detail,
      priceCents: p.priceCents,
      stock: p.stock,
      isHemp: p.isHemp,
    });
    byCategory.set(p.category, list);
  }
  return byCategory;
}
