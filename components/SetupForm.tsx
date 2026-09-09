"use client";

import { useActionState, useRef } from "react";
import { saveGoals } from "@/app/actions/goals";
import { connectX } from "@/app/actions/x";
import { Icon } from "@/components/ui";
import type { SetupState } from "@/lib/form-state";

const initialState: SetupState = { message: "" };

export function GoalsForm() {
  const [state, action, pending] = useActionState(saveGoals, initialState);
  const timeZoneInput = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="form-stack" onSubmit={() => {
      if (timeZoneInput.current) {
        timeZoneInput.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      }
    }}>
      <input ref={timeZoneInput} type="hidden" name="time_zone" defaultValue="UTC" />
      <div className="goal-input-row">
        <div className="field">
          <label htmlFor="daily_post_goal"><Icon name="post" /> Posts per day</label>
          <input id="daily_post_goal" type="number" name="daily_post_goal" min="1" step="1" defaultValue="3" required disabled={pending} />
        </div>
        <div className="field">
          <label htmlFor="daily_reply_goal"><Icon name="reply" /> Replies per day</label>
          <input id="daily_reply_goal" type="number" name="daily_reply_goal" min="1" step="1" defaultValue="10" required disabled={pending} />
        </div>
      </div>
      <div className="form-note"><Icon name="target" /><p>Complete both goals in a day to build your streak. Pick a pace you can keep.</p></div>
      <button className="button button-full" type="submit" disabled={pending}>{pending ? "Saving goals…" : "Continue"}<Icon name="arrow" /></button>
      {state.message && <p className="form-message error" role="alert">{state.message}</p>}
    </form>
  );
}

export function ConnectForm() {
  const [state, action, pending] = useActionState(connectX, initialState);
  return (
    <form action={action} className="form-stack">
      <div className="field">
        <label htmlFor="username">X username</label>
        <div className="input-prefix">
          <span>@</span>
          <input id="username" type="text" name="username" placeholder="yourhandle" autoCapitalize="none" autoCorrect="off" spellCheck={false} pattern="@?[A-Za-z0-9_]{1,15}" title="Enter your X username (up to 15 letters, numbers, or underscores)." required disabled={pending} />
        </div>
        <span className="field-hint">Enter your handle, with or without the @.</span>
      </div>
      <div className="form-note"><span className="x-symbol">𝕏</span><p>We use your public activity to count posts and replies. No X password needed.</p></div>
      <button className="button button-full" type="submit" disabled={pending}>{pending ? "Connecting…" : "Connect account"}<Icon name="arrow" /></button>
      {state.message && <p className="form-message error" role="alert">{state.message}</p>}
    </form>
  );
}
