import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"

 const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
 )

 export async function SignOut() {
    const {error} = await supabase.auth.signOut({scope: "local"});
    redirect("/login"); 
 }