import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lg_admin";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "lethargic-admin";
}

function token() {
  return createHmac("sha256", adminPassword()).update("lg-admin-session-v1").digest("hex");
}

export function passwordMatches(input: string) {
  const a = Buffer.from(createHmac("sha256", "cmp").update(input).digest());
  const b = Buffer.from(createHmac("sha256", "cmp").update(adminPassword()).digest());
  return timingSafeEqual(a, b);
}

export function sessionToken() {
  return token();
}

export async function isAdmin() {
  const jar = await cookies();
  const v = jar.get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}
