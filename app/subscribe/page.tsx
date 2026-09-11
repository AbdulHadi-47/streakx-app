import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PricingCards from "@/components/PricingCards";
import { createClient } from "@/lib/supabase/server";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";

export const metadata: Metadata = { title: "Choose your plan" };

export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subscription = await getSubscription(supabase, user.id);
  if (subscriptionHasAccess(subscription)) redirect("/dashboard");
  const { data: profile } = await supabase.from("profiles").select("x_username").eq("user_id", user.id).maybeSingle();
  const { reason } = await searchParams;
  const configured = Boolean(process.env.CREEM_API_KEY && process.env.CREEM_MONTHLY_PRODUCT_ID && process.env.CREEM_YEARLY_PRODUCT_ID);

  return (
    <>
      <AppHeader current="billing" email={user.email ?? ""} username={profile?.x_username} />
      <main id="main" className="pricing-page subscribe-page">
        <header className="pricing-heading">
          <span className="eyebrow"><span className="blue-dot" /> STREAK X PRO</span>
          <h1>{subscription ? "Keep your momentum going." : "Start your seven-day trial."}</h1>
          <p>{reason === "payment" ? "Your plan needs attention before tracking can continue." : "Choose monthly flexibility or save two months with yearly billing."}</p>
        </header>
        {subscription && !subscriptionHasAccess(subscription) && (
          <div className="billing-notice" role="status">
            <strong>{subscription.status === "past_due" || subscription.status === "unpaid" ? "Payment needs attention" : "Your subscription is inactive"}</strong>
            <span>You can choose a plan below or manage an existing subscription from Settings.</span>
          </div>
        )}
        <PricingCards checkout configured={configured} />
        {subscription?.creem_customer_id && <p className="pricing-footnote">Already subscribed? <a className="text-link" href="/billing/portal">Manage billing with Creem</a></p>}
      </main>
    </>
  );
}
