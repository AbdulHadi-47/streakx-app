import AuthForm from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <AuthShell><AuthForm mode="signup" googleError={status === "google-error"} /></AuthShell>;
}
