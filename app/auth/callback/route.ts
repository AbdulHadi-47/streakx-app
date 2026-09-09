import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const safeDestinations = new Set(["/dashboard", "/reset-password", "/settings"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedNext = params.get("next") ?? "/dashboard";
  const next = safeDestinations.has(requestedNext) ? requestedNext : "/dashboard";
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const providerError = params.get("error") ?? params.get("error_code");
  const supabase = await createClient({ writableCookies: true });
  let error: unknown = providerError ? new Error(providerError) : null;

  if (!error && code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (!error && tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (!error) {
    error = new Error("Missing authentication token");
  }

  const destination = request.nextUrl.clone();
  destination.search = "";
  if (!error) {
    destination.pathname = type === "recovery" ? "/reset-password" : next;
    return NextResponse.redirect(destination);
  }

  destination.pathname = "/auth-link-error";
  destination.searchParams.set("type", type === "recovery" || next === "/reset-password" ? "recovery" : "signup");
  destination.searchParams.set("reason", "expired");
  return NextResponse.redirect(destination);
}
