import AuthForm from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const notice = status === "password-updated" ? "Password updated. Log in with your new password." : "";
  return <AuthShell><AuthForm mode="login" notice={notice} /></AuthShell>;
}
