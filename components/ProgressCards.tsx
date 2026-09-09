import { Icon, type IconName } from "@/components/ui";

export function GoalProgress({ label, count, goal, icon }: { label: string; count: number; goal: number; icon: IconName }) {
  const percentage = Math.min(100, Math.max(0, goal > 0 ? count / goal * 100 : 0));
  const done = count >= goal && goal > 0;
  return <div className={`goal-progress ${done ? "is-complete" : ""}`}><div className="goal-top"><span className="goal-label"><span className="small-icon"><Icon name={icon} /></span>{label}</span><span className={`goal-state ${done ? "blue-text" : ""}`}>{done ? <><Icon name="check" /> Complete</> : `${Math.max(0, goal - count)} to go`}</span></div><div className="goal-numbers"><strong>{count}</strong><span>/ {goal}</span></div><div className="progress-track" role="progressbar" aria-label={`${label}: ${count} of ${goal}`} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(count, goal)}><span style={{ width: `${percentage}%` }} /></div></div>;
}

export function StreakCard({ current, longest, completed }: { current: number; longest: number; completed: boolean }) {
  return <section className="streak-card"><div className="card-label"><Icon name="flame" /> CURRENT STREAK</div><div className="streak-number">{current}<span>{current === 1 ? "day" : "days"}</span></div><h2>{completed ? "Another day. Well done." : current > 0 ? "Keep the momentum." : "Make today day one."}</h2><p>{completed ? "You’ve hit both goals today. See you tomorrow." : current > 0 ? "Every post and reply is a step forward." : "Hit your daily goals to start your streak."}</p><div className="streak-decoration" aria-hidden="true"><Icon name="flame" /></div><div className="streak-best"><span><Icon name="trophy" /> Personal best</span><strong>{longest} {longest === 1 ? "day" : "days"}</strong></div></section>;
}
