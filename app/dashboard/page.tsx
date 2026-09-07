import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { refreshProgress } from "@/app/actions/progress";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("daily_post_goal, daily_reply_goal, x_user_id, x_username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
  }

  if (!profile) {
    redirect("/onboarding");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: dailyProgress, error: progressError } = await supabase
    .from("daily_progress")
    .select(`
      posts_count,
      replies_count,
      goal_completed,
      refresh_count,
      last_refreshed_at
    `)
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (progressError) {
    console.error("Error fetching daily progress:", progressError);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p>Logged in as: {user.email}</p>

      <div className="mt-4">
        <p>Daily Post Goal: {profile.daily_post_goal}</p>
        <p>Daily Reply Goal: {profile.daily_reply_goal}</p>
      </div>

      {profile.x_username ? (
        <p>Connected X: @{profile.x_username}</p>
      ) : (
        <a href="/connect-x">Connect X account</a>
      )}

      <div className="mt-4">
        <p>
          Posts: {dailyProgress?.posts_count ?? 0} / {profile.daily_post_goal}
        </p>

        <p>
          Replies: {dailyProgress?.replies_count ?? 0} / {profile.daily_reply_goal}
        </p>

        <p>
          Refreshes: {dailyProgress?.refresh_count ?? 0} / 3
        </p>

        <p>
          Goal completed: {dailyProgress?.goal_completed ? "Yes" : "No"}
        </p>
      </div>

      <form action={refreshProgress}>
        <button type="submit">Refresh progress</button>
      </form>

      <form action={signOut}>
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}