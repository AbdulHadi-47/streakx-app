"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function connectX(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rawUsername = String(formData.get("username") || "").trim();

  const username = rawUsername.replace(/^@/, "");

  if (!username) {
    throw new Error("Username is required");
  }

  const apiKey = process.env.TWITTER_API_IO_KEY;

  if (!apiKey) {
    throw new Error("Twitter API key is missing");
  }

  const url = new URL(
    "https://api.twitterapi.io/twitter/user/info"
  );

  url.searchParams.set("userName", username);

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("X profile lookup failed:", data);
    throw new Error("Could not find X account");
  }

  const xUser = data.data ?? data;

  const xUserId = String(
    xUser.id ??
    xUser.userId ??
    xUser.id_str ??
    ""
  );

  const xUsername =
    xUser.userName ??
    xUser.username ??
    username;

  if (!xUserId) {
    console.error("Unexpected X response:", data);
    throw new Error("Could not identify X account");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      x_user_id: xUserId,
      x_username: xUsername,
      x_connected_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    throw new Error("Could not connect X account");
  }

  redirect("/onboarding");
}