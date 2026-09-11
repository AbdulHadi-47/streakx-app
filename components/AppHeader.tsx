import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Brand, Icon } from "@/components/ui";

export default function AppHeader({
  current,
  email,
  username,
}: {
  current: "overview" | "settings" | "billing";
  email: string;
  username?: string | null;
}) {
  const name = username ? "@" + username : "Your account";
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <Brand />
          <span className="header-divider" />
          <nav className="app-nav" aria-label="App navigation">
            <Link className={current === "overview" ? "active" : ""} href="/dashboard">Overview</Link>
            <Link className={current === "settings" ? "active" : ""} href="/settings">Settings</Link>
            <Link className={current === "billing" ? "active" : ""} href="/settings#billing">Billing</Link>
          </nav>
        </div>
        <details className="account-menu">
          <summary><span className="avatar">{(username || email || "S").charAt(0).toUpperCase()}</span><span className="account-name">{name}</span><span className="chevron">⌄</span></summary>
          <div className="account-dropdown">
            <span className="account-email">{email}</span>
            <Link href="/settings"><Icon name="settings" /> Settings</Link>
            <form action={signOut}><button type="submit"><Icon name="logout" /> Log out</button></form>
          </div>
        </details>
      </div>
    </header>
  );
}
