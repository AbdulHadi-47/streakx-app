"use client";
import Link from "next/link";
import { Brand, Icon } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="error-page"><Brand /><main id="main"><div className="form-icon"><Icon name="refresh" /></div><span className="eyebrow">LET’S TRY THAT AGAIN</span><h1>A small interruption.</h1><p>We couldn’t load this page. Try again in a moment.</p><div className="error-actions"><button className="button" onClick={reset}>Try again <Icon name="refresh" /></button><Link href="/" className="text-link">Back to home</Link></div></main></div>;
}
