import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BillingActivation from "@/components/BillingActivation";
import { AuthShell, Icon } from "@/components/ui";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Subscription confirmed" };

export default async function BillingSuccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const subscription = await getSubscription(supabase, user.id);
  if (subscriptionHasAccess(subscription)) redirect("/dashboard");

  return (
    <AuthShell>
      <div className="form-icon"><Icon name="check" /></div>
      <h2>Your payment was received.</h2>
      <p className="form-description">Creem is confirming your Streak X Pro access. This usually takes only a few seconds.</p>
      <BillingActivation />
      <Link className="button button-full" href="/dashboard">Continue to dashboard <Icon name="arrow" /></Link>
    </AuthShell>
  );
}
