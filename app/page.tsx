import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";


export default async function Home() {  

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Welcome to StreakX! This is a simple app that helps you track your daily activity on X (formerly Twitter). You can set daily goals for posts and replies, and the app will help you stay on track.
        </p>
      </div>
      </main>
  );
}
