"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SetupState } from "@/lib/form-state";
import { getXAccount } from "@/lib/x/getXAccount";
import { xConnectionErrorMessage } from "@/lib/x/errors";

export async function connectX(_previousState: SetupState, formData: FormData): Promise<SetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = String(formData.get("username") || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) {
    return { message: "Enter a valid X username, using up to 15 letters, numbers, or underscores." };
  }

  let account;
  try {
    account = await getXAccount(username);
  } catch (error) {
    return { message: xConnectionErrorMessage(error) };
  }

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update({
      x_user_id: account.id,
      x_username: account.username,
      x_connected_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select("user_id")
    .maybeSingle();
  if (error) return { message: "Your X account was verified, but we couldn’t save it. Try again." };
  if (!updatedProfile) return { message: "Set your daily goals before connecting your account." };
  redirect("/dashboard");
}
