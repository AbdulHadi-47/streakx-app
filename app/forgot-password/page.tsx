import Link from "next/link";
import { AuthShell, Icon } from "@/components/ui";
import { PasswordResetRequestForm } from "@/components/RecoveryForms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="form-icon"><Icon name="lock" /></div>
      <h2>Reset your password.</h2>
      <p className="form-description">Enter your login email and we’ll send you a secure, single-use reset link.</p>
      <PasswordResetRequestForm />
      <p className="form-switch"><Link href="/login">Back to log in</Link></p>
    </AuthShell>
  );
}
