"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";
import { Icon } from "@/components/ui";
import type { AuthState } from "@/lib/form-state";

const initialState: AuthState = { success: false, message: "", email: "" };

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [state, action, pending] = useActionState(signup ? signUp : signIn, initialState);

  return (
    <>
      <div className="form-icon"><Icon name={signup ? "flame" : "arrow"} /></div>
      <h2>{signup ? "Make consistency a habit." : "Welcome back."}</h2>
      <p className="form-description">
        {signup ? "Create your account. Start showing up on X." : "Your goals are waiting. Let’s keep going."}
      </p>
      <form action={action} className="form-stack" aria-busy={pending}>
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
            minLength={signup ? 6 : undefined} required readOnly={pending} />
          {signup && <span className="field-hint">At least 6 characters.</span>}
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
      </form>
      <p className="form-switch">
        {signup ? "Already have an account?" : "New to Streak X?"}{" "}
        <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </>
  );
}
