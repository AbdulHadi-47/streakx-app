import Link from "next/link";
import type { ReactNode } from "react";

export type IconName = "arrow" | "flame" | "post" | "reply" | "check" | "refresh" | "trophy" | "target" | "logout" | "external" | "settings" | "lock";
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    flame: <path d="M13 3c1 5-4 6-3 10 2 0 3-2 3-4 4 3 5 5 5 7a6 6 0 0 1-12 0c0-4 3-6 3-6-1 4 1 4 1 4-1-5 4-6 3-11Z" />,
    post: <path d="m15 5 4 4M5 19l4-1L20 7a2.8 2.8 0 0 0-4-4L5 14l-1 6ZM13 20h7" />,
    reply: <path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0ZM7 10h8M7 14h5" />,
    check: <path d="m5 12 4 4L19 6" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1" /></>,
    trophy: <path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v7m-4 1h8" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    logout: <path d="M9 4H4v16h5m6-12 4 4-4 4m-6-4h10" />,
    external: <path d="M14 4h6v6m0-6L10 14m-1-9H4v15h15v-5" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function Brand() {
  return <Link href="/" className="brand" aria-label="Streak X home"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>streak<span className="brand-x">x</span><span className="brand-dot" /></Link>;
}
export function PublicHeader() {
  return (
    <header className="site-header marketing-header">
      <div className="header-inner">
        <Brand />
        <nav className="marketing-nav" aria-label="Product navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#faq">FAQs</Link>
        </nav>
        <nav aria-label="Account navigation">
          <Link className="text-link" href="/dashboard">Open app</Link>
          <Link className="button button-small" href="/signup">Get started <Icon name="arrow" /></Link>
        </nav>
      </div>
    </header>
  );
}
export function AuthShell({ children, step }: { children: ReactNode; step?: number }) {
  return <div className="auth-page"><header className="auth-header"><Brand /><Link className="text-link" href="/">Back to home <Icon name="arrow" /></Link></header><main id="main" className="auth-layout"><aside className="auth-story"><span className="eyebrow"><span className="blue-dot" /> BUILT ONE DAY AT A TIME</span><h1>Small steps.<br />Real <span className="muted-heading">momentum.</span></h1><p>You don’t need to do everything.<br />Just show up, hit your goals, and do it again.</p><div className="consistency-art" aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <span key={i} className={i < 27 ? "filled" : ""} />)}</div><div className="story-note"><Icon name="flame" /><span>Your next streak starts today.</span></div></aside><section className="auth-card">{step && <div className="setup-steps" aria-label={`Setup step ${step} of 2`}><span className="active">01 <span>Set your goals</span></span><i /><span className={step === 2 ? "active" : ""}>02 <span>Connect X</span></span></div>}{children}</section></main><footer className="auth-footer">A little progress. Every day.<span>Streak X</span></footer></div>;
}
