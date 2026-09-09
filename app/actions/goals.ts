"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SetupState } from "@/lib/form-state";

export async function saveGoals(_previousState: SetupState, formData: FormData): Promise<SetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const daily_post_goal = Number(formData.get("daily_post_goal"));
  const daily_reply_goal = Number(formData.get("daily_reply_goal"));
  if (!Number.isSafeInteger(daily_post_goal) || !Number.isSafeInteger(daily_reply_goal) || daily_post_goal < 1 || daily_reply_goal < 1) {
    return { message: "Choose a whole number of at least 1 for each goal." };
  }
  const { error } = await supabase.from("profiles").upsert({ user_id: user.id, daily_post_goal, daily_reply_goal }, { onConflict: "user_id" });
  if (error) return { message: "Your goals couldn’t be saved. Please try again." };
  redirect("/connect-x");
}
