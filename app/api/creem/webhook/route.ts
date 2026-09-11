import { Webhook, type FlatSubscriptionEvent } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { applyCreemSubscriptionEvent, type CreemSubscriptionEventData } from "@/lib/billing/creem";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function syncSubscription(event: CreemSubscriptionEventData) {
  await applyCreemSubscriptionEvent(createAdminClient(), event);
}

const sync = (event: FlatSubscriptionEvent<string>) => syncSubscription(event);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CREEM_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Billing webhook is not configured" }, { status: 503 });
  }

  return Webhook({
    webhookSecret,
    onSubscriptionActive: sync,
    onSubscriptionTrialing: sync,
    onSubscriptionPaid: sync,
    onSubscriptionCanceled: sync,
    onSubscriptionExpired: sync,
    onSubscriptionUnpaid: sync,
    onSubscriptionUpdate: sync,
    onSubscriptionPastDue: sync,
    onSubscriptionPaused: sync,
    onSubscriptionScheduledCancel: sync,
  })(request);
}
