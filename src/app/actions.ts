"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkIndexPassword, createIndexToken, INDEX_COOKIE, INDEX_SESSION_TTL_SECONDS } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Unlock the demo list on "/" with DEMO_INDEX_PASSWORD. */
export async function unlockDemoIndex(formData: FormData): Promise<void> {
  const ip = clientIp(await headers());
  if (!rateLimit(`index-login:${ip}`, 10, 15 * 60_000)) redirect("/?error=rate");

  if (!checkIndexPassword(String(formData.get("password") ?? ""))) redirect("/?error=1");

  const token = createIndexToken();
  if (!token) redirect("/");
  (await cookies()).set(INDEX_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INDEX_SESSION_TTL_SECONDS,
  });
  redirect("/");
}
