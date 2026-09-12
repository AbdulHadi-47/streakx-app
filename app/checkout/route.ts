import { randomUUID } from "node:crypto";
import { Checkout } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCreemProductId, isBillingInterval } from "@/lib/billing/plans";
import { creemTestMode } from "@/lib/billing/creem";
import { getSubscriptionLookup, subscriptionHasAccess } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apiKey = process.env.CREEM_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!apiKey || !siteUrl) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { subscription } = await getSubscriptionLookup(supabase, user.id);
  if (subscriptionHasAccess(subscription)) {
    const destination = subscription?.creem_customer_id ? "/billing/portal" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const plan = request.nextUrl.searchParams.get("plan");
  if (!isBillingInterval(plan)) {
    return NextResponse.json({ error: "Invalid billing plan" }, { status: 400 });
  }
  const productId = getCreemProductId(plan);
  if (!productId) {
    return NextResponse.json({ error: "Billing plan is not configured" }, { status: 503 });
  }

  const checkoutUrl = request.nextUrl.clone();
  checkoutUrl.search = "";
  checkoutUrl.searchParams.set("productId", productId);
  checkoutUrl.searchParams.set("units", "1");
  checkoutUrl.searchParams.set("requestId", `${user.id}-${randomUUID()}`);
  checkoutUrl.searchParams.set("customer", JSON.stringify({ email: user.email }));
  checkoutUrl.searchParams.set("referenceId", user.id);
  checkoutUrl.searchParams.set("metadata", JSON.stringify({ source: "streakx_web", billingInterval: plan }));

  const checkout = Checkout({
    apiKey,
    testMode: creemTestMode(),
    defaultSuccessUrl: `${siteUrl}/billing/success`,
  });
  return checkout(new NextRequest(checkoutUrl, { headers: request.headers }));
}
