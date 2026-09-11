import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ActivityHistory, { ActivityHistoryLoading } from "@/components/ActivityHistory";
import AppHeader from "@/components/AppHeader";
import RefreshProgressButton from "@/components/RefreshProgressButton";
import TimeZoneSync from "@/components/TimeZoneSync";
import { Icon } from "@/components/ui";
import { GoalProgress, StreakCard } from "@/components/ProgressCards";
import { calculateStreak } from "@/lib/streak/calculateStreak";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";
import { formatTimeZoneName, normalizeTimeZone, TIME_ZONE_COOKIE, zonedDateKey } from "@/lib/timezone";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const subscription = await getSubscription(supabase, user.id);
  if (!subscriptionHasAccess(subscription)) redirect("/subscribe");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load your profile");
  if (!profile) redirect("/onboarding");

  const cookieTimeZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  const timeZone = normalizeTimeZone(profile.time_zone ?? cookieTimeZone);
  const timeZoneLabel = formatTimeZoneName(timeZone);
  const now = new Date();
  const today = zonedDateKey(now, timeZone);
  const [{ data: dailyProgress, error: progressError }, streak] = await Promise.all([
    supabase
      .from("daily_progress")
      .select("posts_count, replies_count, goal_completed, refresh_count, last_refreshed_at")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
    calculateStreak(user.id, timeZone),
  ]);
  if (progressError) throw new Error("Could not load your daily progress");

  const completed = Boolean(dailyProgress?.goal_completed);
  const connected = Boolean(profile.x_username);
  const username = profile.x_username ?? "";
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(now);
  const lastUpdated = dailyProgress?.last_refreshed_at
    ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone })
        .format(new Date(dailyProgress.last_refreshed_at))
    : null;

  return (
    <>
      <AppHeader current="overview" email={user.email ?? ""} username={username} />

      <main id="main" className="dashboard">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">YOUR DAILY CHECK-IN</span>
            <h1>A little better, every day<span className="blue-text">.</span></h1>
            <p>Show up. Start conversations. Keep your streak alive.</p>
          </div>
          <span className="date-chip">{dateLabel}<span>{timeZoneLabel}</span></span>
        </div>

        {!connected && (
          <div className="connection-banner">
            <span className="form-icon x-symbol">𝕏</span>
            <div><strong>Let’s connect your X account.</strong><p>Your goals are set. Connect X to start tracking your progress.</p></div>
            <Link className="button button-small" href="/connect-x">Connect X <Icon name="arrow" /></Link>
          </div>
        )}

        <div className="dashboard-grid">
          <StreakCard current={streak.currentStreak} longest={streak.longestStreak} completed={completed} />
          <section className="today-card">
            <div className="section-title">
              <h2>Today’s progress</h2>
              <span className={"status-pill " + (completed ? "done" : "")}>
                {completed ? <Icon name="check" /> : <span className="status-dot" />}
                {completed ? "Goals complete" : connected ? "In progress" : "Not connected"}
              </span>
            </div>
            <div className="goals-grid">
              <GoalProgress label="Posts" icon="post" count={dailyProgress?.posts_count ?? 0} goal={profile.daily_post_goal} />
              <GoalProgress label="Replies" icon="reply" count={dailyProgress?.replies_count ?? 0} goal={profile.daily_reply_goal} />
            </div>
            <div className={"daily-message " + (completed ? "completed-message" : "")}>
              <Icon name={completed ? "check" : "target"} />
              <span>{completed ? "You’re all set for today. That’s consistency." : "Complete both goals to add a day to your streak."}</span>
            </div>
            <div className="progress-footer">
              <span><span className="muted-label">LAST UPDATED</span>{lastUpdated ?? "Not refreshed yet"}</span>
              {connected
                ? <RefreshProgressButton refreshCount={dailyProgress?.refresh_count ?? 0} timeZone={timeZone} autoSyncEnabled={profile.auto_sync_enabled ?? true} />
                : <Link className="button button-secondary" href="/connect-x">Connect to track <Icon name="arrow" /></Link>}
            </div>
          </section>
        </div>

        <Suspense fallback={<ActivityHistoryLoading />}>
          <ActivityHistory userId={user.id} today={today} timeZone={timeZone} />
        </Suspense>

        <div className="dashboard-bottom">
          <section className="account-card">
            <span className="small-icon x-symbol">𝕏</span>
            <div><h2>Your X account</h2><p>{connected ? "@" + username : "No account connected"}</p></div>
            {connected
              ? <a className="text-link" href={"https://x.com/" + encodeURIComponent(username)} target="_blank" rel="noreferrer">View profile <Icon name="external" /></a>
              : <Link className="text-link" href="/connect-x">Connect <Icon name="arrow" /></Link>}
          </section>
          <section className="rhythm-note">
            <Icon name="refresh" />
            <div><h2>Automatic progress sync</h2><p>At 12:00 PM and 11:45 PM · <TimeZoneSync savedTimeZone={timeZone} /></p></div>
          </section>
        </div>
        <footer className="dashboard-footer">
          <span><span className="blue-dot" /> One day at a time.</span>
          <span>Daily goals reset at midnight in your time zone.</span>
        </footer>
      </main>
    </>
  );
}
