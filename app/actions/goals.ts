"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { SetupState } from "@/lib/form-state";
import { normalizeTimeZone, TIME_ZONE_COOKIE } from "@/lib/timezone";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";

export async function saveGoals(_previousState: SetupState, formData: FormData): Promise<SetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!subscriptionHasAccess(await getSubscription(supabase, user.id))) redirect("/subscribe");
  const daily_post_goal = Number(formData.get("daily_post_goal"));
  const daily_reply_goal = Number(formData.get("daily_reply_goal"));
  const time_zone = normalizeTimeZone(formData.get("time_zone"));
  if (!Number.isSafeInteger(daily_post_goal) || !Number.isSafeInteger(daily_reply_goal) || daily_post_goal < 1 || daily_reply_goal < 1) {
    return { message: "Choose a whole number of at least 1 for each goal." };
  }
  (await cookies()).set(TIME_ZONE_COOKIE, time_zone, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  let { error } = await supabase.from("profiles").upsert({ user_id: user.id, daily_post_goal, daily_reply_goal, time_zone, time_zone_detected_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error?.code === "PGRST204" || error?.code === "42703") {
    ({ error } = await supabase.from("profiles").upsert({ user_id: user.id, daily_post_goal, daily_reply_goal }, { onConflict: "user_id" }));
  }
  if (error) return { message: "Your goals couldn’t be saved. Please try again." };
  redirect("/connect-x");
}
