"use client"

import { saveGoals } from "@/app/actions/goals";

export default function OnboardingPage() {


    return (
      <form action={saveGoals}>
        <input
          type="number"
          name="daily_post_goal"
          min="1"
          defaultValue="3"
        />

        <input
          type="number"
          name="daily_reply_goal"
          min="1"
          defaultValue="10"
        />

        <button type="submit">Save goals</button>
      </form>
    )

}