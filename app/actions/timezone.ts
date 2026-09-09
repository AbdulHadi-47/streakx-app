"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isValidTimeZone, TIME_ZONE_COOKIE } from "@/lib/timezone";

export async function saveDetectedTimeZone(timeZone: string) {
  if (!isValidTimeZone(timeZone)) return { success: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  (await cookies()).set(TIME_ZONE_COOKIE, timeZone, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: timeZone, time_zone_detected_at: new Date().toISOString() })
    .eq("user_id", user.id);
  revalidatePath("/dashboard");
  return { success: true, persistedToProfile: !error };
}
