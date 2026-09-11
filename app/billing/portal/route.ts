import { NextResponse } from "next/server";
import { creemTestMode } from "@/lib/billing/creem";
import { getSubscription } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const subscription = await getSubscription(supabase, user.id);
  if (!subscription?.creem_customer_id) {
    return NextResponse.redirect(new URL("/subscribe", request.url));
  }
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });

  const baseUrl = creemTestMode() ? "https://test-api.creem.io" : "https://api.creem.io";
  const response = await fetch(`${baseUrl}/v1/customers/billing`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ customer_id: subscription.creem_customer_id }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return NextResponse.json({ error: "Could not open billing management" }, { status: 502 });
  const data = await response.json() as { customer_portal_link?: string };
  if (!data.customer_portal_link) return NextResponse.json({ error: "Billing portal link was unavailable" }, { status: 502 });
  return NextResponse.redirect(data.customer_portal_link);
}
