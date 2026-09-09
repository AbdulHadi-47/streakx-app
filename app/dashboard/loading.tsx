import { Brand } from "@/components/ui";
export default function DashboardLoading() {
  return <><header className="site-header"><div className="header-inner"><Brand /></div></header><main id="main" className="dashboard loading-state" aria-busy="true" aria-label="Loading your page"><span className="eyebrow">GETTING THINGS READY</span><div className="skeleton skeleton-title" /><div className="dashboard-grid"><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /></div><p role="status">Loading your progress…</p></main></>;
}
