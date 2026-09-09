"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui";
import {
  activityLevel, activityValue, buildHeatmap, describeDay, shiftDate,
  type ActivityMetric, type ActivityRange, type ActivityRow,
} from "@/lib/activity/heatmap";

const metrics: { value: ActivityMetric; label: string }[] = [
  { value: "all", label: "All activity" },
  { value: "posts", label: "Posts" },
  { value: "replies", label: "Replies" },
];
const levels = ["0", "1–4", "5–9", "10–19", "20+"];
const formatNumber = (value: number) => value.toLocaleString("en");

export default function ActivityHeatmap({
  rows, today, demo = false, timeZone = "UTC",
}: { rows: ActivityRow[]; today: string; demo?: boolean; timeZone?: string }) {
  const id = useId();
  const [range, setRange] = useState<ActivityRange>(365);
  const [metric, setMetric] = useState<ActivityMetric>("all");
  const [selectedDate, setSelectedDate] = useState(today);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const calendar = useMemo(() => buildHeatmap(rows, today, range), [rows, today, range]);
  const selected = calendar.days.find((day) => day.date === selectedDate) ?? calendar.days[calendar.days.length - 1];
  const highlighted = calendar.days.find((day) => day.date === hoveredDate) ?? selected;
  const total = metric === "posts" ? calendar.summary.posts : metric === "replies"
    ? calendar.summary.replies : calendar.summary.posts + calendar.summary.replies;
  const unit = metric === "all" ? "posts & replies" : metric;

  useEffect(() => {
    // Start mobile users at the most recent dates, without moving keyboard focus.
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [range]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const offsets: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    let destination: string;
    if (event.key === "Home") destination = calendar.start;
    else if (event.key === "End") destination = today;
    else if (event.key in offsets) destination = shiftDate(date, offsets[event.key]);
    else return;
    event.preventDefault();
    destination = destination < calendar.start ? calendar.start : destination > today ? today : destination;
    setSelectedDate(destination);
    setHoveredDate(null);
    const button = buttons.current.get(destination);
    button?.focus({ preventScroll: true });
    button?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  return (
    <section className="activity-heatmap" aria-labelledby={`${id}-title`}>
      <div className="heatmap-heading">
        <div>
          <h2 id={`${id}-title`}><Icon name="target" />{demo ? "Your activity, at a glance" : "Activity overview"}</h2>
          <p>{demo ? "Example data. Your own calendar fills in as you refresh progress." : "Every square is a day you had the chance to show up."}</p>
        </div>
        <label className="heatmap-range">
          <span className="sr-only">Activity date range</span>
          <select value={range} onChange={(event) => {
            setRange(Number(event.target.value) as ActivityRange);
            setSelectedDate(today);
            setHoveredDate(null);
          }}>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
            <option value={365}>Last year</option>
          </select>
        </label>
      </div>

      <div className="heatmap-summary">
        <div><strong>{formatNumber(calendar.summary.posts)}</strong><span>Posts</span></div>
        <div><strong>{formatNumber(calendar.summary.replies)}</strong><span>Replies</span></div>
        <div><strong>{calendar.summary.activeDays}<small> / {range}</small></strong><span>Active days</span></div>
        <div><strong className="blue-text">{calendar.summary.completedDays}</strong><span>Days with goals met</span></div>
      </div>

      <div className="heatmap-toolbar">
        <div className="heatmap-filters" role="group" aria-label="Activity type">
          {metrics.map(({ value, label }) => (
            <button type="button" key={value} aria-pressed={metric === value}
              onClick={() => setMetric(value)}>{label}</button>
          ))}
        </div>
        <span className="heatmap-range-label">{calendar.start} — {today} <span>{demo ? "YOUR LOCAL TIME" : timeZone.replaceAll("_", " ")}</span></span>
      </div>

      <p className="sr-only" id={`${id}-instructions`}>Select a day for details. Use up and down arrows for adjacent days, left and right arrows for adjacent weeks, and Home or End for the first or last day.</p>
      <div className="heatmap-scroll" ref={scrollRef}>
        <div className="heatmap-calendar" style={{ gridTemplateColumns: `28px repeat(${calendar.weeks.length}, var(--heat-cell))` }}>
          <div className="heatmap-months" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${calendar.weeks.length}, var(--heat-cell))` }}>
            {calendar.months.map(({ label, column }) => <span key={column} style={{ gridColumn: column + 1 }}>{label}</span>)}
          </div>
          <div className="heatmap-weekdays" aria-hidden="true"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
          {calendar.weeks.map((week, index) => (
            <div className="heatmap-week" key={index}>
              {week.map((day, rowIndex) => day ? (
                <button type="button" key={day.date}
                  ref={(element) => { if (element) buttons.current.set(day.date, element); else buttons.current.delete(day.date); }}
                  className={`heatmap-cell heat-level-${activityLevel(activityValue(day, metric))}${day.recorded ? "" : " unrecorded"}${day.completed ? " goals-met" : ""}${day.date === today ? " is-today" : ""}`}
                  title={describeDay(day)} aria-label={describeDay(day)}
                  aria-pressed={day.date === selected.date} aria-describedby={`${id}-instructions`}
                  tabIndex={day.date === selected.date ? 0 : -1}
                  onClick={() => { setSelectedDate(day.date); setHoveredDate(null); }}
                  onFocus={() => { setSelectedDate(day.date); setHoveredDate(null); }}
                  onMouseEnter={() => setHoveredDate(day.date)} onMouseLeave={() => setHoveredDate(null)}
                  onKeyDown={(event) => navigate(event, day.date)}
                />
              ) : <span className="heatmap-padding" key={`padding-${rowIndex}`} aria-hidden="true" />)}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend-row">
        <span><strong>{formatNumber(total)}</strong> {unit} in {range} days{demo && <b className="heatmap-demo-label">EXAMPLE</b>}</span>
        <div className="heatmap-legend" aria-label={`Activity intensity: ${levels.join(", ")} ${unit} per day. Outlined squares indicate both goals completed.`}>
          <span>Less</span>{levels.map((label, level) => <span key={level} className={`heatmap-swatch heat-level-${level}`} title={`${label} ${unit}`} />)}<span>More</span>
          <span className="heatmap-legend-goal"><i className="heatmap-swatch heat-level-2 goals-met" />Goals met</span>
        </div>
      </div>

      <div className="heatmap-day-detail" aria-live="polite" aria-atomic="true">
        <div className="heatmap-detail-date"><Icon name={highlighted.completed ? "check" : "post"} /><span>{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${highlighted.date}T00:00:00Z`))}{highlighted.date === today && <small>{demo ? "Example today" : "Today"}</small>}</span></div>
        {highlighted.recorded ? (
          <div className="heatmap-detail-counts"><span><b>{highlighted.posts}</b> posts</span><span><b>{highlighted.replies}</b> replies</span><span className={highlighted.completed ? "blue-text" : ""}>{highlighted.completed ? "Both goals completed" : "Goals not completed"}</span></div>
        ) : <p>No saved activity for this day.</p>}
      </div>
      <p className="heatmap-footnote">{calendar.summary.recordedDays === 0 && !demo ? "Your calendar is ready. Refresh progress to save your first day. " : ""}Counts are saved when you refresh. Dashed squares have no saved data; they don’t necessarily mean no activity.</p>
    </section>
  );
}
