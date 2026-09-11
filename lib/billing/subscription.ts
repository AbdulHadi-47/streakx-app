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

const ACTIVE_STATUSES = new Set(["active", "trialing", "scheduled_cancel"]);

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

export async function getSubscription(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, creem_customer_id, creem_subscription_id, creem_product_id, billing_interval, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not load your subscription");
  return data as SubscriptionRecord | null;
}
