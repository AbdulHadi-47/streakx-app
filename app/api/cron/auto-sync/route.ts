import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { syncProgressForProfile, type SyncProfile } from "@/lib/progress/sync-progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { dueAutoSyncSlot, dueAutoSyncSlotForUser, normalizeTimeZone, zonedDateKey } from "@/lib/timezone";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.SYNC_CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "Unknown sync error";
}

async function runAutoSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, x_username, daily_post_goal, daily_reply_goal, time_zone")
    .eq("auto_sync_enabled", true)
    .not("x_username", "is", null);

  if (error) {
    console.error("Could not load profiles for automatic sync:", error);
    return NextResponse.json({ error: "Could not load sync profiles" }, { status: 500 });
  }

  const profilesInWindow = (profiles ?? []).flatMap((profile) => {
    const timeZone = normalizeTimeZone(profile.time_zone);
    const slot = dueAutoSyncSlot(now, timeZone);
    return slot ? [{ profile: profile as SyncProfile, timeZone, slot }] : [];
  });

  const dueProfiles = profilesInWindow.filter(({ profile, timeZone }) =>
    dueAutoSyncSlotForUser(now, timeZone, profile.user_id),
  );

  const results = {
    inWindow: profilesInWindow.length,
    due: dueProfiles.length,
    deferred: profilesInWindow.length - dueProfiles.length,
    synced: 0,
    skipped: 0,
    failed: 0,
  };

  // Keep automatic work well below the provider's 20 QPS ceiling and leave
  // capacity available for user-triggered dashboard refreshes.
  for (let index = 0; index < dueProfiles.length; index += 3) {
    const batch = dueProfiles.slice(index, index + 3);
    await Promise.all(batch.map(async ({ profile, timeZone, slot }) => {
      const localDate = zonedDateKey(now, timeZone);
      const { data: claimed, error: claimError } = await supabase.rpc("claim_auto_sync", {
        p_user_id: profile.user_id,
        p_local_date: localDate,
        p_slot: slot,
      });

      if (claimError || !claimed) {
        if (claimError) console.error("Could not claim automatic sync:", claimError);
        results.skipped++;
        return;
      }

      try {
        await syncProgressForProfile(supabase, profile, { now });
        const { error: completionError } = await supabase
          .from("auto_sync_runs")
          .update({ status: "success", completed_at: new Date().toISOString(), error: null })
          .eq("user_id", profile.user_id)
          .eq("local_date", localDate)
          .eq("slot", slot);
        if (completionError) throw completionError;
        results.synced++;
      } catch (syncError) {
        const message = errorMessage(syncError);
        console.error(`Automatic sync failed for user ${profile.user_id}:`, syncError);
        await supabase
          .from("auto_sync_runs")
          .update({ status: "failed", completed_at: new Date().toISOString(), error: message })
          .eq("user_id", profile.user_id)
          .eq("local_date", localDate)
          .eq("slot", slot);
        results.failed++;
      }
    }));
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = runAutoSync;
export const POST = runAutoSync;
