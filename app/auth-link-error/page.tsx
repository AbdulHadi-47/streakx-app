import Link from "next/link";
import { AuthShell, Icon } from "@/components/ui";
import { PasswordResetRequestForm, ResendConfirmationForm } from "@/components/RecoveryForms";

export default async function AuthLinkErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; reason?: string }>;
}) {
  const { type } = await searchParams;
  const recovery = type === "recovery";
  return (
    <AuthShell>
      <div className="form-icon"><Icon name={recovery ? "lock" : "refresh"} /></div>
      <h2>This email link can’t be used.</h2>
      <p className="form-description">It may have expired, already been opened, or been changed by an email scanner. Request a fresh link below.</p>
      {recovery ? <PasswordResetRequestForm /> : <ResendConfirmationForm />}
      <p className="form-switch"><Link href="/login">Back to log in</Link></p>
    </AuthShell>
  );
}
