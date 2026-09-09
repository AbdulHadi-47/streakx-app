"use client";

import { useActionState } from "react";
import { requestPasswordReset, resendConfirmation, updateRecoveredPassword } from "@/app/actions/auth";
import type { RecoveryState } from "@/lib/form-state";
import { Icon } from "@/components/ui";

const initialState: RecoveryState = { success: false, message: "" };

function Message({ state }: { state: RecoveryState }) {
  return state.message
    ? <p className={"form-message " + (state.success ? "success" : "error")} role={state.success ? "status" : "alert"}>{state.message}</p>
    : null;
}

export function PasswordResetRequestForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(requestPasswordReset, { ...initialState, email: defaultEmail });
  return (
    <form action={action} className="form-stack">
      <div className="field"><label htmlFor="recovery-email">Email address</label><input id="recovery-email" name="email" type="email" autoComplete="email" defaultValue={state.email} placeholder="you@example.com" readOnly={pending} required /></div>
      <button className="button button-full" type="submit" disabled={pending || state.success}>{pending ? "Sending…" : state.success ? "Email sent" : "Send reset link"}<Icon name="arrow" /></button>
      <Message state={state} />
    </form>
  );
}

export function ResendConfirmationForm() {
  const [state, action, pending] = useActionState(resendConfirmation, initialState);
  return (
    <form action={action} className="form-stack">
      <div className="field"><label htmlFor="confirmation-email">Email address</label><input id="confirmation-email" name="email" type="email" autoComplete="email" defaultValue={state.email} placeholder="you@example.com" readOnly={pending} required /></div>
      <button className="button button-full" type="submit" disabled={pending || state.success}>{pending ? "Sending…" : state.success ? "Email sent" : "Send a new link"}<Icon name="arrow" /></button>
      <Message state={state} />
    </form>
  );
}

export function RecoveredPasswordForm() {
  const [state, action, pending] = useActionState(updateRecoveredPassword, initialState);
  return (
    <form action={action} className="form-stack">
      <div className="field"><label htmlFor="recovery-password">New password</label><input id="recovery-password" name="password" type="password" minLength={8} autoComplete="new-password" readOnly={pending} required /><span className="field-hint">Use at least 8 characters.</span></div>
      <div className="field"><label htmlFor="recovery-password-confirmation">Confirm new password</label><input id="recovery-password-confirmation" name="password_confirmation" type="password" minLength={8} autoComplete="new-password" readOnly={pending} required /></div>
      <button className="button button-full" type="submit" disabled={pending}>{pending ? "Updating…" : "Set new password"}<Icon name="check" /></button>
      <Message state={state} />
    </form>
  );
}
