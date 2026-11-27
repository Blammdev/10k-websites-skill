import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const b = (await req.json().catch(() => ({}))) as {
    stock?: number;
    posItemId?: string;
    active?: boolean;
    priceCents?: number;
  };
  const patch: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
  if (b.stock !== undefined) {
    const n = Math.floor(Number(b.stock));
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Bad stock" }, { status: 400 });
    patch.stock = n;
  }
  if (b.priceCents !== undefined) {
    const n = Math.floor(Number(b.priceCents));
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Bad price" }, { status: 400 });
    patch.priceCents = n;
  }
  if (b.posItemId !== undefined) patch.posItemId = String(b.posItemId).trim() || null;
  if (b.active !== undefined) patch.active = !!b.active;
  await db.update(products).set(patch).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}
