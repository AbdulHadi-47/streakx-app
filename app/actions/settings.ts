"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidTimeZone, TIME_ZONE_COOKIE } from "@/lib/timezone";

export type SettingsState = { success: boolean; message: string };

function setTimeZoneCookie(timeZone: string) {
  return cookies().then((store) => store.set(TIME_ZONE_COOKIE, timeZone, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }));
}

async function findXAccount(username: string) {
  const apiKey = process.env.TWITTER_API_IO_KEY;
  if (!apiKey) throw new Error("X connection is temporarily unavailable.");
  const url = new URL("https://api.twitterapi.io/twitter/user/info");
  url.searchParams.set("userName", username);
  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("We couldn’t find that X account.");
  const result = await response.json();
  const account = result.data ?? result;
  const id = String(account.id ?? account.userId ?? account.id_str ?? "");
  if (!id) throw new Error("We couldn’t identify that X account.");
  return { id, username: String(account.userName ?? account.username ?? username) };
}

export async function updateSettings(_state: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Your session expired. Please log in again." };

  const dailyPostGoal = Number(formData.get("daily_post_goal"));
  const dailyReplyGoal = Number(formData.get("daily_reply_goal"));
  const timeZone = String(formData.get("time_zone") ?? "").trim();
  const autoSyncEnabled = formData.get("auto_sync_enabled") === "on";
  const requestedUsername = String(formData.get("x_username") ?? "").trim().replace(/^@/, "");

  if (!Number.isSafeInteger(dailyPostGoal) || !Number.isSafeInteger(dailyReplyGoal) || dailyPostGoal < 1 || dailyReplyGoal < 1) {
    return { success: false, message: "Daily goals must be whole numbers of at least 1." };
  }
  if (!isValidTimeZone(timeZone)) {
    return { success: false, message: "Enter a valid time zone such as Asia/Karachi." };
  }
  if (requestedUsername && !/^[A-Za-z0-9_]{1,15}$/.test(requestedUsername)) {
    return { success: false, message: "Enter a valid X username." };
  }

  const { data: currentProfile, error: readError } = await supabase
    .from("profiles")
    .select("x_username")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError || !currentProfile) return { success: false, message: "Could not load your settings." };

  const updates: Record<string, string | number | boolean> = {
    daily_post_goal: dailyPostGoal,
    daily_reply_goal: dailyReplyGoal,
    time_zone: timeZone,
    time_zone_detected_at: new Date().toISOString(),
    auto_sync_enabled: autoSyncEnabled,
  };

  if (requestedUsername && requestedUsername.toLowerCase() !== currentProfile.x_username?.toLowerCase()) {
    try {
      const account = await findXAccount(requestedUsername);
      updates.x_user_id = account.id;
      updates.x_username = account.username;
      updates.x_connected_at = new Date().toISOString();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Could not connect that X account." };
    }
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("user_id")
    .maybeSingle();
  if (error || !updated) return { success: false, message: "Could not save your settings. Please try again." };

  await setTimeZoneCookie(timeZone);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true, message: "Settings saved." };
}

export async function changePassword(_state: SettingsState, formData: FormData): Promise<SettingsState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");
  if (password.length < 8) return { success: false, message: "Use at least 8 characters." };
  if (password !== confirmation) return { success: false, message: "The passwords don’t match." };

  const supabase = await createClient({ writableCookies: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Your session expired. Please log in again." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, message: "Could not update your password. Please try again." };
  return { success: true, message: "Password updated." };
}

export async function changeEmail(_state: SettingsState, formData: FormData): Promise<SettingsState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }
  const supabase = await createClient({ writableCookies: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Your session expired. Please log in again." };
  if (user.email?.toLowerCase() === email) return { success: false, message: "That is already your login email." };
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { success: false, message: "Could not update your email. Please try again." };
  return { success: true, message: "Check your inbox to confirm the new email address." };
}

export async function disconnectX(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({
    x_user_id: null,
    x_username: null,
    x_connected_at: null,
  }).eq("user_id", user.id);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
