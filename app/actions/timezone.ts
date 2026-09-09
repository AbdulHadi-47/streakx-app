"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidTimeZone } from "@/lib/timezone";

export async function saveDetectedTimeZone(timeZone: string) {
  if (!isValidTimeZone(timeZone)) return { success: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: timeZone, time_zone_detected_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) return { success: false };
  revalidatePath("/dashboard");
  return { success: true };
}
