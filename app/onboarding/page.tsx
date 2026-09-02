import { saveGoals } from "@/app/actions/goals";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {

    const supabase = createClient();

     const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      redirect("/dashboard");
    }

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