import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posSettings } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";
import {
  applyPosEvent,
  getSettings,
  pullInventory,
  syncPendingOrders,
  type PosEvent,
} from "@/lib/pos";

export const dynamic = "force-dynamic";

/** Settings update */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await getSettings();
  await db
    .update(posSettings)
    .set({
      provider: b.provider === "square" ? "square" : "simulator",
      locationName: String(b.locationName ?? "").slice(0, 120) || "Lethargic Gardens Shop",
      locationId: String(b.locationId ?? "").slice(0, 120),
      autoSync: !!b.autoSync,
      syncInventory: !!b.syncInventory,
    })
    .where(eq(posSettings.id, 1));
  return NextResponse.json({ ok: true });
}

/** Actions: push | pull | simulate */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as {
    action?: string;
    event?: PosEvent;
  };
  if (b.action === "push") {
    return NextResponse.json(await syncPendingOrders());
  }
  if (b.action === "pull") {
    return NextResponse.json(await pullInventory());
  }
  if (b.action === "simulate" && b.event) {
    const r = await applyPosEvent(b.event);
    return NextResponse.json(r, { status: r.ok ? 200 : 422 });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
