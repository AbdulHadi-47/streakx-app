import AuthForm from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";
export default function SignupPage() {
  return <AuthShell><AuthForm mode="signup" /></AuthShell>;
}
