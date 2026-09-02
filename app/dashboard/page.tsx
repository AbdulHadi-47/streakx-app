import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";


export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error} = await supabase
    .from("profiles")
    .select("daily_post_goal, daily_reply_goal")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Logged in as: {user.email}</p>

      <div className="mt-4">
        <p>Daily Post Goal: {profile?.daily_post_goal || "Not set"}</p>
        <p>Daily Reply Goal: {profile?.daily_reply_goal || "Not set"}</p>
      </div>

      <form action={signOut}> 
        <button type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}