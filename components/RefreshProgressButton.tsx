"use client";

import Link from "next/link";
import { useActionState } from "react";
import { refreshProgress, type RefreshState } from "@/app/actions/progress";
import { Icon } from "@/components/ui";
import { formatTimeZoneName } from "@/lib/timezone";

const initialState: RefreshState = { success: false, message: "" };

export default function RefreshProgressButton({
  refreshCount = 0,
  timeZone = "UTC",
  autoSyncEnabled = true,
}: {
  refreshCount?: number;
  timeZone?: string;
  autoSyncEnabled?: boolean;
}) {
  const [state, action, pending] = useActionState(refreshProgress, initialState);
  const remaining = Math.max(0, 3 - refreshCount);
  const zone = formatTimeZoneName(timeZone);

  return (
    <div className="refresh-control">
      <form action={action}>
        <button className="button" type="submit" disabled={pending || remaining === 0}>
          <Icon name="refresh" className={pending ? "spin" : ""} />
          {pending ? "Refreshing…" : remaining === 0 ? "Manual limit reached" : "Refresh progress"}
        </button>
      </form>
      {remaining === 0 ? (
        <span className="refresh-hint">
          Resets at midnight in {zone}.{" "}
          {autoSyncEnabled
            ? "Your 11:45 PM automatic sync will still run."
            : <Link href="/settings">Turn on automatic sync in Settings.</Link>}
        </span>
      ) : (
        <span className="refresh-hint">{remaining} of 3 manual refreshes left. Automatic syncs don’t use them.</span>
      )}
      {state.message && <p className={"form-message " + (state.success ? "success" : "error")} role="status">{state.message}</p>}
    </div>
  );
}
