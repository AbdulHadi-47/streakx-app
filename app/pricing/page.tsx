import type { Metadata } from "next";
import Link from "next/link";
import PricingCards from "@/components/PricingCards";
import { PublicHeader } from "@/components/ui";
import TopLink from "@/components/TopLink";

export const metadata: Metadata = { title: "Pricing", description: "Simple pricing for Streak X Pro." };

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="pricing-page">
        <header className="pricing-heading">
          <span className="eyebrow"><span className="blue-dot" /> SIMPLE PRICING. SERIOUS CONSISTENCY.</span>
          <h1>One plan.<br /><span className="muted-heading">Every reason to show up.</span></h1>
          <p>Choose the billing rhythm that works for you and start building a visible streak.</p>
        </header>
        <PricingCards />
        <p className="pricing-footnote">Prices are in USD. Taxes may apply. Payments are securely handled by Creem.</p>
      </main>
      <footer className="landing-footer pricing-footer">
        <Link href="/">Streak X</Link>
        <nav aria-label="Legal navigation"><TopLink href="/privacy#page-top">Privacy</TopLink><TopLink href="/terms#page-top">Terms</TopLink><a href="mailto:support@streakx.online">Support</a></nav>
        <span>A little progress. Every day.</span>
      </footer>
    </>
  );
}
