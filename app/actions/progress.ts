"use server";

import { createClient } from "@/lib/supabase/server";
import { getDailyProgress } from "@/lib/x/getDailyProgress";
import { revalidatePath } from "next/cache";

export async function refreshProgress() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      x_username,
      daily_post_goal,
      daily_reply_goal
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    throw new Error("Could not load profile");
  }

  if (!profile?.x_username) {
    throw new Error("X account is not connected");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: existingProgress, error: progressError } = await supabase
    .from("daily_progress")
    .select("refresh_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (progressError) {
    console.error(progressError);
    throw new Error("Could not load today's progress");
  }

  const refreshCount = existingProgress?.refresh_count ?? 0;

  if (refreshCount >= 3) {
    throw new Error("Daily refresh limit reached");
  }

  const progress = await getDailyProgress(profile.x_username);

  const goalCompleted =
    progress.posts >= profile.daily_post_goal &&
    progress.replies >= profile.daily_reply_goal;

  const { error: upsertError } = await supabase
    .from("daily_progress")
    .upsert(
      {
        user_id: user.id,
        date: today,
        posts_count: progress.posts,
        replies_count: progress.replies,
        goal_completed: goalCompleted,
        refresh_count: refreshCount + 1,
        last_refreshed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,date",
      }
    );

  if (upsertError) {
    console.error(upsertError);
    throw new Error("Could not save progress");
  }

  revalidatePath("/dashboard");
}