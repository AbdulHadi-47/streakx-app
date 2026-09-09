import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AppHeader from "@/components/AppHeader";
import { EmailForm, PasswordForm, PreferencesForm } from "@/components/SettingsForms";
import { Icon } from "@/components/ui";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeTimeZone, TIME_ZONE_COOKIE } from "@/lib/timezone";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your settings");
  if (!profile) redirect("/onboarding");

  const cookieTimeZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  const timeZone = normalizeTimeZone(profile.time_zone ?? cookieTimeZone);

  return (
    <>
      <AppHeader current="settings" email={user.email ?? ""} username={profile.x_username} />
      <main id="main" className="settings-page">
        <div className="settings-heading"><span className="eyebrow">YOUR ACCOUNT</span><h1>Settings<span className="blue-text">.</span></h1><p>Manage how Streak X tracks your day and account.</p></div>

        <PreferencesForm
          postGoal={profile.daily_post_goal}
          replyGoal={profile.daily_reply_goal}
          timeZone={timeZone}
          autoSyncEnabled={profile.auto_sync_enabled ?? true}
          username={profile.x_username}
        />

        <section className="settings-section settings-account-section">
          <div className="settings-section-copy"><span className="settings-icon"><Icon name="lock" /></span><div><h2>Account and security</h2><p>Your login email and password.</p></div></div>
          <div className="settings-account-content">
            <EmailForm email={user.email ?? ""} />
            <PasswordForm />
            <div className="settings-signout"><div><strong>Sign out</strong><p>End your current Streak X session.</p></div><form action={signOut}><button className="button button-secondary button-small" type="submit"><Icon name="logout" /> Log out</button></form></div>
          </div>
        </section>
      </main>
    </>
  );
}
