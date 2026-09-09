"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthState, RecoveryState } from "@/lib/form-state";
import { getSiteUrl } from "@/lib/site-url";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function authMessage(error: { code?: string; message: string; status?: number }) {
  if (error.code === "email_not_confirmed") {
    return "Please confirm your email using the link in your inbox, then log in.";
  }
  if (error.code === "invalid_credentials") {
    return "That email and password don’t match. Please try again.";
  }
  if (error.status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  if (error.code === "weak_password") {
    return "That password is too easy to guess. Use at least 8 characters and avoid common passwords.";
  }
  if (!error.status || error.status >= 500) {
    return "We couldn’t reach the sign-in service. Please try again in a moment.";
  }
  return error.message;
}

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  if (!email || !password) return { success: false, message: "Enter your email and password.", email };

  try {
    // The action writes session cookies before the redirect response is sent.
    // This also avoids browser auth-lock stalls and client-router cache races.
    const supabase = await createClient({ writableCookies: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: authMessage(error), email };
    if (!data.session) return { success: false, message: "A session couldn’t be started. Please try again.", email };
  } catch {
    return { success: false, message: "We couldn’t finish logging you in. Please try again.", email };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  if (!email || password.length < 8) {
    return { success: false, message: "Enter an email and a password with at least 8 characters.", email };
  }

  try {
    const supabase = await createClient({ writableCookies: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=/dashboard` },
    });
    if (error) return { success: false, message: authMessage(error), email };
    if (!data.session) {
      return { success: true, message: "Check your inbox to confirm your email, then come back to log in.", email };
    }
  } catch {
    return { success: false, message: "We couldn’t create your account. Please try again.", email };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordReset(_previous: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { success: false, message: "Enter your email address.", email };
  try {
    const supabase = await createClient({ writableCookies: true });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await getSiteUrl()}/auth/callback?next=/reset-password`,
    });
    if (error?.status === 429) return { success: false, message: "Too many requests. Wait a few minutes and try again.", email };
    if (error) return { success: false, message: "We couldn’t send the reset email. Try again in a moment.", email };
  } catch {
    return { success: false, message: "The email service is temporarily unavailable. Try again in a moment.", email };
  }
  return { success: true, message: "If an account exists for that email, a password-reset link is on its way.", email };
}

export async function resendConfirmation(_previous: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { success: false, message: "Enter your email address.", email };
  try {
    const supabase = await createClient({ writableCookies: true });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=/dashboard` },
    });
    if (error?.status === 429) return { success: false, message: "Too many requests. Wait a few minutes and try again.", email };
    if (error) return { success: false, message: "We couldn’t resend the confirmation email.", email };
  } catch {
    return { success: false, message: "The email service is temporarily unavailable.", email };
  }
  return { success: true, message: "A new confirmation link is on its way.", email };
}

export async function updateRecoveredPassword(_previous: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");
  if (password.length < 8) return { success: false, message: "Use at least 8 characters." };
  if (password !== confirmation) return { success: false, message: "The passwords don’t match." };
  const supabase = await createClient({ writableCookies: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "This reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === "weak_password") {
    return { success: false, message: "That password is too easy to guess. Choose a stronger one." };
  }
  if (error) return { success: false, message: "We couldn’t update your password. Request a new reset link." };
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?status=password-updated");
}

export async function signOut() {
  const supabase = await createClient({ writableCookies: true });
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not log out. Please try again.");
  revalidatePath("/", "layout");
  redirect("/login");
}
