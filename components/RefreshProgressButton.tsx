"use client";

import { useActionState } from "react";
import {
  refreshProgress,
  type RefreshState,
} from "@/app/actions/progress";

const initialState: RefreshState = {
  success: false,
  message: "",
};

export default function RefreshProgressButton() {
  const [state, action, pending] = useActionState(
    refreshProgress,
    initialState
  );

  return (
    <div>
      <form action={action}>
        <button type="submit" disabled={pending}>
          {pending ? "Refreshing..." : "Refresh progress"}
        </button>
      </form>

      {state.message && (
        <p>
          {state.message}
        </p>
      )}
    </div>
  );
}