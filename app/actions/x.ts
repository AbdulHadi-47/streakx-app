"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SetupState } from "@/lib/form-state";

export async function connectX(_previousState: SetupState, formData: FormData): Promise<SetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const username = String(formData.get("username") || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) return { message: "Enter a valid X username, using up to 15 letters, numbers, or underscores." };
  const apiKey = process.env.TWITTER_API_IO_KEY;
  if (!apiKey) return { message: "X connection is temporarily unavailable. Please try again later." };
  const url = new URL("https://api.twitterapi.io/twitter/user/info");
  url.searchParams.set("userName", username);
  try {
    const response = await fetch(url, { headers: { "X-API-Key": apiKey }, cache: "no-store" });
    if (!response.ok) return { message: "We couldn’t find that X account. Check the handle and try again." };
    const data = await response.json();
    const xUser = data.data ?? data;
    const xUserId = String(xUser.id ?? xUser.userId ?? xUser.id_str ?? "");
    const xUsername = xUser.userName ?? xUser.username ?? username;
    if (!xUserId) return { message: "We couldn’t identify that account. Check the handle and try again." };
    const { data: updatedProfile, error } = await supabase.from("profiles").update({
      x_user_id: xUserId, x_username: xUsername, x_connected_at: new Date().toISOString(),
    }).eq("user_id", user.id).select("user_id").maybeSingle();
    if (error) return { message: "Your account couldn’t be connected. Please try again." };
    if (!updatedProfile) return { message: "Set your daily goals before connecting your account." };
  } catch {
    return { message: "We couldn’t reach X. Please try again in a moment." };
  }
  redirect("/dashboard");
}
