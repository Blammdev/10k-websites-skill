import { NextResponse } from "next/server";
import { createOrder, OrderError, validateOrderInput } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const input = validateOrderInput(body);
    const order = await createOrder(input);
    return NextResponse.json({ code: order.code, totalCents: order.totalCents }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("order failed", e);
    return NextResponse.json({ error: "Something went wrong placing your order" }, { status: 500 });
  }
}
