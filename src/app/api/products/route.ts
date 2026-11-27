import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/pos";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder));
  return NextResponse.json({
    products: rows.map((p) => ({
      id: p.id,
      kind: p.kind,
      category: p.category,
      name: p.name,
      priceCents: p.priceCents,
      stock: p.stock,
      sku: p.sku,
      isHemp: p.isHemp,
    })),
  });
}
