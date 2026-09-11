"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ProgressSyncError, syncProgressForProfile } from "@/lib/progress/sync-progress";
import { createClient } from "@/lib/supabase/server";
import { TIME_ZONE_COOKIE } from "@/lib/timezone";
import { xRefreshErrorMessage } from "@/lib/x/errors";
import { getSubscription, subscriptionHasAccess } from "@/lib/billing/subscription";

export type RefreshState = {
  success: boolean;
  message: string;
};

export async function refreshProgress(): Promise<RefreshState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Your session has expired. Please log in again." };
  }
  if (!subscriptionHasAccess(await getSubscription(supabase, user.id))) {
    return { success: false, message: "Choose a Streak X Pro plan to refresh your progress." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return { success: false, message: "Could not load your profile. Please try again." };
  }
  if (!profile?.x_username) {
    return { success: false, message: "Connect your X account first." };
  }

  try {
    const cookieTimeZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
    const result = await syncProgressForProfile(
      supabase,
      { ...profile, user_id: user.id, time_zone: profile.time_zone ?? cookieTimeZone },
      { incrementManualRefresh: true },
    );
    if (!result.success) {
      return { success: false, message: "You’ve used all 3 refreshes available for manual checks today. They reset at local midnight; automatic syncs don’t use this allowance." };
    }
  } catch (syncError) {
    console.error(syncError);
    if (syncError instanceof ProgressSyncError) {
      return {
        success: false,
        message: syncError.code === "database_read"
          ? "We couldn’t check today’s saved progress. No refresh was used—try again."
          : "X activity was checked, but we couldn’t save it. No refresh was used—try again.",
      };
    }
    return { success: false, message: xRefreshErrorMessage(syncError, profile.x_username) };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Progress updated successfully" };
}
