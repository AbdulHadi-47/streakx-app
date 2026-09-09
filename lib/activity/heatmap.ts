export type ActivityRow = {
  date: string;
  posts_count: number;
  replies_count: number;
  goal_completed: boolean;
};

export type ActivityMetric = "all" | "posts" | "replies";
export type ActivityRange = 90 | 180 | 365;

export type ActivityDay = {
  date: string;
  posts: number;
  replies: number;
  completed: boolean;
  recorded: boolean;
};

const DAY_MS = 86_400_000;
const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

export function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS)
    .toISOString().slice(0, 10);
}

export function activityValue(day: ActivityDay, metric: ActivityMetric) {
  if (metric === "posts") return day.posts;
  if (metric === "replies") return day.replies;
  return day.posts + day.replies;
}

// Fixed buckets keep a color's meaning stable across filters and date ranges.
export function activityLevel(count: number) {
  if (count <= 0) return 0;
  if (count < 5) return 1;
  if (count < 10) return 2;
  if (count < 20) return 3;
  return 4;
}

function safeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function buildHeatmap(rows: ActivityRow[], today: string, range: ActivityRange) {
  const start = shiftDate(today, 1 - range);
  const lookup = new Map(rows.map((row) => [row.date, row]));
  const days: ActivityDay[] = Array.from({ length: range }, (_, index) => {
    const date = shiftDate(start, index);
    const row = lookup.get(date);
    return {
      date,
      posts: safeCount(row?.posts_count ?? 0),
      replies: safeCount(row?.replies_count ?? 0),
      completed: row?.goal_completed === true,
      recorded: Boolean(row),
    };
  });

  // Sunday-first columns, matching the weekday labels; padding is not a day.
  const offset = new Date(`${start}T00:00:00Z`).getUTCDay();
  const cells: (ActivityDay | null)[] = Array(offset).fill(null);
  cells.push(...days);
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );

  const months: { label: string; column: number }[] = [];
  let previousMonth = "";
  weeks.forEach((week, column) => {
    const day = week.find((day) => day?.date.endsWith("-01"))
      ?? (!previousMonth ? week.find((day) => day !== null) : undefined);
    if (!day) return;
    const month = day.date.slice(0, 7);
    if (month === previousMonth) return;
    // Avoid overlapping two labels when a range starts near a month boundary.
    if (months.length && column - months[months.length - 1].column < 3) months.pop();
    months.push({
      label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })
        .format(new Date(`${day.date}T00:00:00Z`)),
      column,
    });
    previousMonth = month;
  });

  const summary = days.reduce((total, day) => ({
    posts: total.posts + day.posts,
    replies: total.replies + day.replies,
    activeDays: total.activeDays + Number(day.posts + day.replies > 0),
    completedDays: total.completedDays + Number(day.completed),
    recordedDays: total.recordedDays + Number(day.recorded),
  }), { posts: 0, replies: 0, activeDays: 0, completedDays: 0, recordedDays: 0 });

  return { start, days, weeks, months, summary };
}

export function describeDay(day: ActivityDay) {
  const label = dayFormatter.format(new Date(`${day.date}T00:00:00Z`));
  if (!day.recorded) return `${label}: No saved activity.`;
  return `${label}: ${day.posts} ${day.posts === 1 ? "post" : "posts"}, ${day.replies} ${day.replies === 1 ? "reply" : "replies"}. ${day.completed ? "Both goals completed." : "Goals not completed."}`;
}
