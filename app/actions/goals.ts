"use server"

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveGoals(formData: FormData){
    const supabase = await createClient()

    const { data: {user} } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const daily_post_goal = Number(formData.get('daily_post_goal'))
    const daily_reply_goal = Number(formData.get('daily_reply_goal'))

    if (
        !Number.isInteger(daily_post_goal) ||
        !Number.isInteger(daily_reply_goal) ||
        daily_post_goal < 1 ||
        daily_reply_goal < 1
    ) {
        throw new Error("Invalid goals");
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            user_id: user.id,
            daily_post_goal,
            daily_reply_goal
        },
        {
            onConflict: 'user_id',
        }
    )   

    if (error) {
        throw new Error('Error saving goals')
    }

    redirect('/dashboard')
}