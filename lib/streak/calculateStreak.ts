import { createClient } from "@/lib/supabase/server";
import { normalizeTimeZone, zonedDateKey } from "@/lib/timezone";

type ProgressRow = {
  date: string;
  goal_completed: boolean;
};

type StreakResult = {
  currentStreak: number;
  longestStreak: number;
};

export async function calculateStreak(
  userId: string,
  timeZone = "UTC",
): Promise<StreakResult> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("daily_progress")
    .select("date, goal_completed")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Could not fetch daily progress");
  }

  const progressRows: ProgressRow[] = rows ?? [];

  const today = zonedDateKey(new Date(), normalizeTimeZone(timeZone));

  let currentStreak = 0;

  const expectedDate = new Date(`${today}T00:00:00Z`);

  const todayRow = progressRows.find((row) => row.date === today);

  if (!todayRow?.goal_completed) {
    expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
  }

  for (const row of progressRows) {
    if (!row.goal_completed) {
      continue;
    }

    const expectedDateString = expectedDate.toISOString().split("T")[0];

    if (row.date !== expectedDateString) {
      break;
    }

    currentStreak++;

    expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: Date | null = null;

  const completedRows = progressRows
    .filter((row) => row.goal_completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const row of completedRows) {
    const currentDate = new Date(`${row.date}T00:00:00Z`);

    if (!previousDate) {
      runningStreak = 1;
    } else {
      const expectedNextDate = new Date(previousDate);
      expectedNextDate.setUTCDate(expectedNextDate.getUTCDate() + 1);

      const expectedNextDateString =
        expectedNextDate.toISOString().split("T")[0];

      if (row.date === expectedNextDateString) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, runningStreak);

    previousDate = currentDate;
  }

  return {
    currentStreak,
    longestStreak,
  };
}
