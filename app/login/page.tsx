import AuthForm from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";
export default function LoginPage() {
  return <AuthShell><AuthForm mode="login" /></AuthShell>;
}
