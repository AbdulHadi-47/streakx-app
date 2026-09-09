"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/form-state";

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
  if (!email || password.length < 6) {
    return { success: false, message: "Enter an email and a password with at least 6 characters.", email };
  }

  try {
    const supabase = await createClient({ writableCookies: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
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

export async function signOut() {
  const supabase = await createClient({ writableCookies: true });
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not log out. Please try again.");
  revalidatePath("/", "layout");
  redirect("/login");
}
