"use client";
import { useActionState } from "react";
import { refreshProgress, type RefreshState } from "@/app/actions/progress";
import { Icon } from "@/components/ui";

const initialState: RefreshState = { success: false, message: "" };
export default function RefreshProgressButton({ refreshCount = 0 }: { refreshCount?: number }) {
  const [state, action, pending] = useActionState(refreshProgress, initialState);
  const remaining = Math.max(0, 3 - refreshCount);
  return <div className="refresh-control"><form action={action}><button className="button" type="submit" disabled={pending || remaining === 0}><Icon name="refresh" className={pending ? "spin" : ""} />{pending ? "Refreshing…" : remaining === 0 ? "Daily limit reached" : "Refresh progress"}</button></form><span className="refresh-hint">{remaining === 0 ? "Available again tomorrow" : `${remaining} of 3 refreshes left today`}</span>{state.message && <p className={`form-message ${state.success ? "success" : "error"}`} role="status">{state.message}</p>}</div>;
}
