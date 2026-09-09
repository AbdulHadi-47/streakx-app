"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { changeEmail, changePassword, disconnectX, updateSettings, type SettingsState } from "@/app/actions/settings";
import { Icon } from "@/components/ui";

const initialState: SettingsState = { success: false, message: "" };
const subscribe = () => () => {};

function FormStatus({ state }: { state: SettingsState }) {
  return state.message
    ? <p className={"form-message " + (state.success ? "success" : "error")} role="status">{state.message}</p>
    : null;
}

export function PreferencesForm({
  postGoal,
  replyGoal,
  timeZone,
  autoSyncEnabled,
  username,
}: {
  postGoal: number;
  replyGoal: number;
  timeZone: string;
  autoSyncEnabled: boolean;
  username?: string | null;
}) {
  const [state, action, pending] = useActionState(updateSettings, initialState);
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZone);
  const detectedTimeZone = useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone,
    () => timeZone,
  );

  return (
    <form action={action} className="settings-form">
      <section className="settings-section">
        <div className="settings-section-copy"><span className="settings-icon"><Icon name="target" /></span><div><h2>Daily goals</h2><p>Choose the activity targets that count as a completed day.</p></div></div>
        <div className="settings-fields two-columns">
          <div className="field"><label htmlFor="settings-post-goal">Posts per day</label><input id="settings-post-goal" name="daily_post_goal" type="number" min="1" step="1" defaultValue={postGoal} disabled={pending} required /></div>
          <div className="field"><label htmlFor="settings-reply-goal">Replies per day</label><input id="settings-reply-goal" name="daily_reply_goal" type="number" min="1" step="1" defaultValue={replyGoal} disabled={pending} required /></div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-copy"><span className="settings-icon"><Icon name="refresh" /></span><div><h2>Time and syncing</h2><p>Your local day controls progress, streaks, refresh limits, and the activity heat map.</p></div></div>
        <div className="settings-fields">
          <div className="field">
            <label htmlFor="settings-time-zone">Time zone</label>
            <div className="timezone-control">
              <input id="settings-time-zone" name="time_zone" value={selectedTimeZone} onChange={(event) => setSelectedTimeZone(event.target.value)} disabled={pending} required />
              <button className="button button-secondary button-small" type="button" onClick={() => setSelectedTimeZone(detectedTimeZone)} disabled={pending}>Use this device</button>
            </div>
            <span className="field-hint">Detected on this device: {detectedTimeZone.replaceAll("_", " ")}</span>
          </div>
          <label className="toggle-row">
            <span><strong>Automatic progress sync</strong><small>Sync at 12:00 PM and 11:45 PM in your time zone.</small></span>
            <input type="checkbox" name="auto_sync_enabled" defaultChecked={autoSyncEnabled} disabled={pending} />
            <i aria-hidden="true" />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-copy"><span className="settings-icon x-symbol">𝕏</span><div><h2>Connected X account</h2><p>Change the public account used to count posts and replies.</p></div></div>
        <div className="settings-fields">
          <div className="field"><label htmlFor="settings-x-username">X username</label><div className="input-prefix"><span>@</span><input id="settings-x-username" name="x_username" defaultValue={username ?? ""} placeholder="yourhandle" autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={pending} /></div></div>
          {username && <button className="settings-danger-link" type="submit" formAction={disconnectX}>Disconnect @{username}</button>}
        </div>
      </section>

      <div className="settings-save">
        <FormStatus state={state} />
        <button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}<Icon name="check" /></button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialState);
  return (
    <form action={action} className="settings-fields password-form">
      <div className="settings-fields two-columns">
        <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" minLength={8} autoComplete="new-password" disabled={pending} required /></div>
        <div className="field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" name="password_confirmation" type="password" minLength={8} autoComplete="new-password" disabled={pending} required /></div>
      </div>
      <div className="password-actions"><FormStatus state={state} /><button className="button button-secondary" type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</button></div>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changeEmail, initialState);
  return (
    <form action={action} className="settings-fields email-form">
      <div className="field"><label htmlFor="account-email">Email address</label><input id="account-email" name="email" type="email" defaultValue={email} autoComplete="email" disabled={pending} required /></div>
      <div className="password-actions"><FormStatus state={state} /><button className="button button-secondary" type="submit" disabled={pending}>{pending ? "Sending…" : "Change email"}</button></div>
    </form>
  );
}
