"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export default function SigninPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();

    setMessage("Signing in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    console.log(data);
    setMessage("Logged In Successfully");
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSignin}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Login to your Account</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3"
          required
        />

        <button
          type="submit"
          className="bg-black p-3 text-white"
        >
          Login
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}