"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function PublicAccountNav() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) {
    return <nav className="public-account-nav loading" aria-label="Loading account navigation"><span /></nav>;
  }

  if (!user) {
    return (
      <nav className="public-account-nav" aria-label="Account navigation">
        <Link className="text-link" href="/dashboard">Open app</Link>
        <Link className="button button-small" href="/signup">Get started <span aria-hidden="true">→</span></Link>
      </nav>
    );
  }

  return (
    <nav className="public-account-nav signed-in" aria-label="Account navigation">
      <details className="account-menu marketing-account-menu">
        <summary>
          <span className="avatar">{(user.email ?? "S").charAt(0).toUpperCase()}</span>
          <span className="account-name">Account</span>
          <span className="chevron">⌄</span>
        </summary>
        <div className="account-dropdown">
          <span className="account-email">{user.email}</span>
          <Link href="/dashboard">Dashboard <span aria-hidden="true">→</span></Link>
          <Link href="/settings">Settings <span aria-hidden="true">→</span></Link>
        </div>
      </details>
    </nav>
  );
}
