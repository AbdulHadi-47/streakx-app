import Link from "next/link";
import { BILLING_PLANS, PLAN_FEATURES, type BillingInterval } from "@/lib/billing/plans";
import { Icon } from "@/components/ui";

export default function PricingCards({ checkout = false, configured = true }: { checkout?: boolean; configured?: boolean }) {
  return (
    <div className="pricing-grid">
      {(Object.keys(BILLING_PLANS) as BillingInterval[]).map((interval) => {
        const plan = BILLING_PLANS[interval];
        const href = checkout ? `/checkout?plan=${interval}` : "/signup";
        return (
          <article className={`pricing-card ${interval === "yearly" ? "featured" : ""}`} key={interval}>
            <div className="pricing-card-top">
              <span className="pricing-plan-name">{plan.label}</span>
              {interval === "yearly" && <span className="savings-pill">2 MONTHS FREE</span>}
            </div>
            <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.cadence}</span></div>
            <p>{interval === "yearly" ? "$8.33 per month, billed annually. Save almost two full months." : "Simple monthly billing with the freedom to cancel anytime."}</p>
            {configured ? (
              <Link className={`button button-full ${interval === "monthly" ? "button-secondary" : ""}`} href={href}>
                Choose {plan.label.toLowerCase()} <Icon name="arrow" />
              </Link>
            ) : (
              <button className="button button-full" type="button" disabled>Checkout setup required</button>
            )}
          </article>
        );
      })}
      <section className="pricing-includes" aria-label="Everything included with Streak X Pro">
        <div className="pricing-includes-heading">
          <span className="eyebrow">EVERYTHING IN STREAK X PRO</span>
          <h2>Everything you need to stay consistent.</h2>
          <p>One focused toolkit for turning daily activity into a streak you can see and protect.</p>
        </div>
        <div>
          {PLAN_FEATURES.map((feature) => (
            <article className="pricing-benefit" key={feature.title}>
              <span className="pricing-benefit-icon"><Icon name="check" /></span>
              <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
            </article>
          ))}
        </div>
      </section>
      <p className="pricing-legal">
        When you purchase a subscription, you agree to the <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}
