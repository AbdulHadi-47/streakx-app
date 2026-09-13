"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signIn, signInWithGoogle, signUp } from "@/app/actions/auth";
import { Icon } from "@/components/ui";
import TopLink from "@/components/TopLink";
import type { AuthState } from "@/lib/form-state";

const initialState: AuthState = { success: false, message: "", email: "" };

function GoogleSignInButton({ signup }: { signup: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="button button-secondary button-full google-auth-button" type="submit" disabled={pending}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
        <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.36-.17-2.02H12v3.82h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.32Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.57A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.88a6 6 0 0 1 0-3.76V7.55H3.06a10 10 0 0 0 0 8.9l3.33-2.57Z" />
        <path fill="#EA4335" d="M12 5.99c1.43 0 2.72.49 3.73 1.47l2.87-2.87A9.55 9.55 0 0 0 12 2a10 10 0 0 0-8.94 5.55l3.33 2.57C7.18 7.75 9.39 5.99 12 5.99Z" />
      </svg>
      {pending ? "Opening Google…" : signup ? "Sign up with Google" : "Continue with Google"}
    </button>
  );
}

export default function AuthForm({ mode, notice = "", googleError = false }: { mode: "login" | "signup"; notice?: string; googleError?: boolean }) {
  const signup = mode === "signup";
  const [state, action, pending] = useActionState(signup ? signUp : signIn, initialState);

  return (
    <>
      <div className="form-icon"><Icon name={signup ? "flame" : "arrow"} /></div>
      <h2>{signup ? "Make consistency a habit." : "Welcome back."}</h2>
      <p className="form-description">
        {signup ? "Create your account. Start showing up on X." : "Your goals are waiting. Let’s keep going."}
      </p>
      <form action={signInWithGoogle} className="google-auth-form">
        <input type="hidden" name="mode" value={mode} />
        <GoogleSignInButton signup={signup} />
      </form>
      {googleError && <p className="form-message error google-auth-error" role="alert">Google sign-in couldn’t be completed. Please try again.</p>}
      <div className="auth-divider"><span>or continue with email</span></div>
      <form action={action} className="form-stack" aria-busy={pending}>
        {notice && <p className="form-message success" role="status">{notice}</p>}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com"
            autoComplete="email" defaultValue={state.email} required readOnly={pending} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password"
            placeholder={signup ? "Create a password" : "Enter your password"}
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={signup ? 8 : undefined} required readOnly={pending} />
          {signup && <span className="field-hint">At least 8 characters.</span>}
          {!signup && <Link className="field-action" href="/forgot-password">Forgot password?</Link>}
        </div>
        <button className="button button-full" disabled={pending || state.success} type="submit">
          {pending ? (signup ? "Creating account…" : "Logging in…") : (signup ? "Create account" : "Log in")}
          <Icon name="arrow" />
        </button>
        {state.message && (
          <p role={state.success ? "status" : "alert"}
            className={`form-message ${state.success ? "success" : "error"}`}>
            {state.message}
          </p>
        )}
        {!signup && state.message.includes("confirm your email") && (
          <Link className="field-action" href="/auth-link-error?type=signup">Send a new confirmation email</Link>
        )}
      </form>
      <p className="form-switch">
        {signup ? "Already have an account?" : "New to Streak X?"}{" "}
        <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link>
      </p>
      {signup && (
        <p className="auth-legal">
          By creating an account, you agree to the <TopLink href="/terms#page-top">Terms of Service</TopLink> and acknowledge the <TopLink href="/privacy#page-top">Privacy Policy</TopLink>.
        </p>
      )}
    </>
  );
}
