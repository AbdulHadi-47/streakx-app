import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient({ writableCookies = false } = {}) {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: (input, init) => fetch(input, {
          ...init,
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(12000)])
            : AbortSignal.timeout(12000),
        }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            // Server Components cannot write cookies; proxy refreshes them.
            // In actions, cookie failures must never look like a successful login.
            if (writableCookies) throw error;
          }
        },
      },
    },
  );
}
