"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { syncProgressForProfile } from "@/lib/progress/sync-progress";
import { createClient } from "@/lib/supabase/server";
import { TIME_ZONE_COOKIE } from "@/lib/timezone";

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
      return { success: false, message: "You've used all 3 refreshes for today." };
    }
  } catch (syncError) {
    console.error(syncError);
    return { success: false, message: "Could not refresh your X activity. Try again in a moment." };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Progress updated successfully" };
}
