import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthShell, Icon } from "@/components/ui";
import { GoalsForm } from "@/components/SetupForm";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const subscription = await getSubscription(supabase, user.id);
  if (!subscriptionHasAccess(subscription)) redirect("/subscribe");
  const { data: profile, error } = await supabase.from("profiles").select("id, x_username").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your profile");
  if (profile) redirect(profile.x_username ? "/dashboard" : "/connect-x");
  return <AuthShell step={1}><div className="form-icon"><Icon name="target" /></div><h2>Find your daily rhythm.</h2><p className="form-description">A few posts. A few conversations. Set a daily goal that works for you.</p><GoalsForm /></AuthShell>;
}
