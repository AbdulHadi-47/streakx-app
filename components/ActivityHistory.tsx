import { createClient } from "@/lib/supabase/server";
import { shiftDate } from "@/lib/activity/heatmap";
import ActivityHeatmap from "@/components/ActivityHeatmap";

export default async function ActivityHistory({ userId, today }: { userId: string; today: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_progress")
    .select("date, posts_count, replies_count, goal_completed")
    .eq("user_id", userId)
    .gte("date", shiftDate(today, -364))
    .lte("date", today)
    .order("date", { ascending: true })
    .limit(365);

  if (error) {
    return <section className="activity-heatmap heatmap-error" role="status"><h2>Activity overview</h2><p>Your activity history couldn’t be loaded. Reload the page to try again.</p></section>;
  }
  return <ActivityHeatmap rows={data ?? []} today={today} />;
}

export function ActivityHistoryLoading() {
  return <section className="activity-heatmap" aria-busy="true" aria-label="Loading activity history"><div className="heatmap-heading"><h2>Activity overview</h2></div><div className="skeleton heatmap-loading" /><p className="heatmap-footnote" role="status">Loading your saved activity…</p></section>;
}
