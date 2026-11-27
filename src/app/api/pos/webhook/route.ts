import { NextResponse } from "next/server";
import { applyPosEvent, webhookSecret, type PosEvent } from "@/lib/pos";

export const dynamic = "force-dynamic";

/**
 * Inbound POS webhook. Send header `x-pos-secret: <POS_WEBHOOK_SECRET>`.
 *
 *   { "type": "sale.completed", "reference": "R-1042",
 *     "items": [{ "sku": "LG-HP1", "quantity": 2 }] }
 *   { "type": "inventory.updated", "sku": "LG-MC1", "quantity": 12 }
 */
export async function POST(req: Request) {
  if (req.headers.get("x-pos-secret") !== webhookSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as PosEvent | null;
  if (!body || typeof body !== "object" || !("type" in body)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
  const result = await applyPosEvent(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
