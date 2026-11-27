import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { OrderError, setOrderStatus } from "@/lib/orders";
import { syncOrder } from "@/lib/pos";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { status?: string; action?: string };
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  try {
    if (body.action === "sync") {
      const r = await syncOrder(orderId);
      return NextResponse.json(r, { status: r.ok ? 200 : 502 });
    }
    await setOrderStatus(orderId, String(body.status ?? ""));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
