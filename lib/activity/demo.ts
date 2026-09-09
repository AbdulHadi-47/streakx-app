import { shiftDate, type ActivityRow } from "./heatmap";

// Only the public product example uses these illustrative records.
// Dashboard history always comes from the signed-in user's daily_progress.
export const DEMO_TODAY = "2026-09-09";
export const demoActivity: ActivityRow[] = Array.from({ length: 365 }, (_, index) => {
  const seed = (index * 37 + 11) % 101;
  const posts = seed < 18 ? 0 : seed % 6;
  const replies = seed < 18 ? 0 : (seed * 3) % 24;
  return {
    date: shiftDate(DEMO_TODAY, index - 364),
    posts_count: posts,
    replies_count: replies,
    goal_completed: posts >= 3 && replies >= 10,
  };
}).filter((_, index) => index % 19 !== 0);
