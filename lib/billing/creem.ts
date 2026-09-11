import type { SupabaseClient } from "@supabase/supabase-js";
import { billingIntervalForProduct } from "@/lib/billing/plans";

type CreemEntity = { id: string } | string | null | undefined;

export type CreemSubscriptionEventData = {
  webhookId: string;
  webhookCreatedAt: number;
  id: string;
  status: string;
  product: CreemEntity;
  customer: CreemEntity;
  metadata?: Record<string, string | number | null>;
  current_period_end_date?: Date | string | null;
};

function entityId(entity: CreemEntity) {
  return typeof entity === "string" ? entity : entity?.id ?? null;
}

function isoDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function creemTestMode() {
  return process.env.CREEM_TEST_MODE === "true";
}

export async function applyCreemSubscriptionEvent(supabase: SupabaseClient, event: CreemSubscriptionEventData) {
  const userId = event.metadata?.referenceId;
  const productId = entityId(event.product);
  const customerId = entityId(event.customer);
  const interval = productId ? billingIntervalForProduct(productId) : null;

  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
    throw new Error("Creem subscription is missing a valid user reference");
  }
  if (!productId || !interval) {
    throw new Error("Creem subscription references an unknown product");
  }

  const { error } = await supabase.rpc("apply_creem_subscription_event", {
    p_user_id: userId,
    p_creem_customer_id: customerId,
    p_creem_subscription_id: event.id,
    p_creem_product_id: productId,
    p_billing_interval: interval,
    p_status: event.status,
    p_current_period_end: isoDate(event.current_period_end_date),
    p_cancel_at_period_end: event.status === "scheduled_cancel",
    p_event_id: event.webhookId,
    p_event_created_at: event.webhookCreatedAt,
  });
  if (error) throw error;
}
