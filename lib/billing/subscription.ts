import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionRecord = {
  user_id: string;
  creem_customer_id: string | null;
  creem_subscription_id: string | null;
  creem_product_id: string | null;
  billing_interval: "monthly" | "yearly" | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const ACTIVE_STATUSES = new Set(["active", "scheduled_cancel"]);

type SubscriptionError = { code?: string; message?: string };

export function isSubscriptionStoreUnavailable(error: SubscriptionError | null) {
  return Boolean(error && (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("public.subscriptions") ||
    error.message?.includes("relation \"subscriptions\" does not exist")
  ));
}

export function subscriptionHasAccess(subscription: Pick<SubscriptionRecord, "status" | "current_period_end"> | null, now = new Date()) {
  if (!subscription) return false;
  if (ACTIVE_STATUSES.has(subscription.status)) return true;

  // Keep already-paid access through the recorded billing period when a
  // cancellation or payment retry arrives before that period ends.
  if ((subscription.status === "canceled" || subscription.status === "past_due") && subscription.current_period_end) {
    return new Date(subscription.current_period_end).getTime() > now.getTime();
  }
  return false;
}

export async function getSubscriptionLookup(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, creem_customer_id, creem_subscription_id, creem_product_id, billing_interval, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Could not load subscription:", error);
    if (isSubscriptionStoreUnavailable(error)) {
      return { subscription: null, available: false } as const;
    }
    throw new Error("Could not load your subscription");
  }
  return { subscription: data as SubscriptionRecord | null, available: true } as const;
}

export async function getSubscription(supabase: SupabaseClient, userId: string) {
  const lookup = await getSubscriptionLookup(supabase, userId);
  if (!lookup.available) throw new Error("Subscription storage is not configured");
  return lookup.subscription;
}
