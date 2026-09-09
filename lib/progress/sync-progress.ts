import { getDailyProgress } from "@/lib/x/getDailyProgress";
import { normalizeTimeZone, zonedDateKey } from "@/lib/timezone";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SyncProfile = {
  user_id: string;
  x_username: string;
  daily_post_goal: number;
  daily_reply_goal: number;
  time_zone?: string | null;
};

export async function syncProgressForProfile(
  supabase: SupabaseClient,
  profile: SyncProfile,
  options: { now?: Date; incrementManualRefresh?: boolean } = {},
) {
  const now = options.now ?? new Date();
  const timeZone = normalizeTimeZone(profile.time_zone);
  const localDate = zonedDateKey(now, timeZone);
  const { data: existing, error: readError } = await supabase
    .from("daily_progress")
    .select("refresh_count")
    .eq("user_id", profile.user_id)
    .eq("date", localDate)
    .maybeSingle();
  if (readError) throw new Error("Could not load daily progress");

  const refreshCount = existing?.refresh_count ?? 0;
  if (options.incrementManualRefresh && refreshCount >= 3) {
    return { success: false as const, reason: "limit" as const, localDate };
  }

  const progress = await getDailyProgress(profile.x_username, timeZone, localDate);
  const { error: writeError } = await supabase.from("daily_progress").upsert({
    user_id: profile.user_id,
    date: localDate,
    posts_count: progress.posts,
    replies_count: progress.replies,
    goal_completed: progress.posts >= profile.daily_post_goal && progress.replies >= profile.daily_reply_goal,
    ...(options.incrementManualRefresh ? { refresh_count: refreshCount + 1 } : {}),
    last_refreshed_at: now.toISOString(),
    updated_at: now.toISOString(),
  }, { onConflict: "user_id,date" });
  if (writeError) throw new Error("Could not save daily progress");
  return { success: true as const, progress, localDate };
}
