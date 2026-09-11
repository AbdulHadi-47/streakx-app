import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/ui";
import { ConnectForm } from "@/components/SetupForm";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";

export default async function ConnectXPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const subscription = await getSubscription(supabase, user.id);
  if (!subscriptionHasAccess(subscription)) redirect("/subscribe");
  const { data: profile, error } = await supabase.from("profiles").select("id, x_username").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your profile");
  if (!profile) redirect("/onboarding");
  if (profile.x_username) redirect("/dashboard");
  return <AuthShell step={2}><div className="form-icon x-symbol">𝕏</div><h2>Bring your X along.</h2><p className="form-description">Connect your account to turn your daily activity into a streak.</p><ConnectForm /><p className="form-switch"><Link href="/dashboard">I’ll do this later</Link></p></AuthShell>;
}
