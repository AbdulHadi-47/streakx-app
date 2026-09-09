import { redirect } from "next/navigation";
import { AuthShell, Icon } from "@/components/ui";
import { RecoveredPasswordForm } from "@/components/RecoveryForms";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth-link-error?type=recovery&reason=expired");
  return (
    <AuthShell>
      <div className="form-icon"><Icon name="lock" /></div>
      <h2>Choose a new password.</h2>
      <p className="form-description">Your reset link was accepted. Set a new password to secure your account.</p>
      <RecoveredPasswordForm />
    </AuthShell>
  );
}
