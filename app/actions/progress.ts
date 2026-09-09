"use server";

import { createClient } from "@/lib/supabase/server";
import { getDailyProgress } from "@/lib/x/getDailyProgress";
import { revalidatePath } from "next/cache";

export type RefreshState = {
  success: boolean;
  message: string;
};

export async function refreshProgress(): Promise<RefreshState> {

  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Your session has expired. Please log in again." };
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
    return { success: false, message: "Could not load your profile. Please try again." };
  }

  if (!profile?.x_username) {
  return {
    success: false,
    message: "Connect your X account first.",
    };
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
    return { success: false, message: "Could not load today’s progress. Please try again." };
  }

  const refreshCount = existingProgress?.refresh_count ?? 0;

  if (refreshCount >= 3) {
    return {
      success: false,
      message: "You've used all 3 refreshes for today.",
    };
  }

  let progress;
  try {
    progress = await getDailyProgress(profile.x_username);
  } catch {
    return { success: false, message: "Could not refresh your X activity. Try again in a moment." };
  }

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

      return {
        success: false,
        message: "Could not save your progress. Try again.",
      };
    }

  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Progress updated successfully",
  };
}
