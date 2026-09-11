import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of Streak X.",
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these Terms",
    content: <><p>These Terms of Service govern your access to streakx.online and the Streak X application. By creating an account, purchasing a subscription, or using the service, you agree to these Terms and our Privacy Policy.</p><p>If you use Streak X on behalf of an organization, you represent that you have authority to bind that organization. If you do not agree to these Terms, do not use the service.</p></>,
  },
  {
    id: "service",
    title: "The Streak X service",
    content: <><p>Streak X helps users set daily posting and reply goals, retrieve counts from public X activity, view streaks and activity history, and synchronize progress according to a chosen time zone. Features, limits, and supported integrations may change as the product develops.</p><p>Streak X is an independent service and is not affiliated with, endorsed by, or sponsored by X Corp. “X” and related marks belong to their respective owners.</p></>,
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    content: <><p>You must be at least 13 years old and legally capable of entering these Terms. If you are under the age of legal majority where you live, a parent or legal guardian must authorize your use. You must be legally able to purchase a subscription to use paid features.</p><p>Provide accurate account information, keep your credentials secure, and promptly notify us of suspected unauthorized access. You are responsible for activity performed through your account. One subscription is intended for one person and one connected X account unless we expressly agree otherwise.</p></>,
  },
  {
    id: "x-activity",
    title: "Connected X activity",
    content: <><p>You may connect only an X username that you own, control, or are authorized to track. Streak X reads public activity associated with that username through a data provider. You do not provide your X password, and Streak X does not publish or interact on X for you.</p><p>Activity counts may be delayed, incomplete, or affected by deleted posts, account privacy, provider availability, platform changes, rate limits, or classification differences. You remain responsible for your activity on X and for following X’s terms and applicable law.</p></>,
  },
  {
    id: "subscriptions",
    title: "Subscriptions and payments",
    content: <><p>Streak X Pro is offered as a recurring monthly or yearly subscription at the price shown before checkout. Prices are displayed in USD unless stated otherwise. Taxes and available payment methods may depend on your location.</p><p>Creem acts as Merchant of Record and processes checkout, payment details, taxes, receipts, renewals, refunds, and chargebacks. By purchasing, you also agree to the terms presented by Creem at checkout. Your subscription begins after successful payment confirmation and renews automatically for the selected billing period until canceled.</p><p>We may change prices prospectively. If a price change affects an existing subscription, we will provide notice when required and it will apply no earlier than a future renewal.</p></>,
  },
  {
    id: "cancellation-refunds",
    title: "Cancellation and refunds",
    content: <><p>You may cancel from Settings through the Creem customer portal. Cancellation stops future renewals. Unless the checkout terms, applicable law, or Creem state otherwise, you retain access through the end of the paid billing period and do not receive a prorated refund for unused time.</p><p>If the service is materially unavailable or you believe a charge was made in error, contact <a href="mailto:support@streakx.online">support@streakx.online</a> promptly with the account email and transaction details. Refund requests are evaluated under applicable consumer law and Creem’s Merchant of Record obligations. Nothing in these Terms limits mandatory refund or cancellation rights available in your location.</p></>,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: <><p>You agree not to:</p><ul><li>use Streak X for unlawful, deceptive, abusive, harassing, or fraudulent activity;</li><li>connect or monitor an account without authorization;</li><li>attempt to bypass subscription checks, refresh limits, rate limits, authentication, or security controls;</li><li>scrape, reverse engineer, probe, disrupt, overload, or introduce malicious code into the service;</li><li>resell, sublicense, or provide shared access to the service without permission;</li><li>use automated means that place unreasonable load on Streak X or its providers; or</li><li>infringe intellectual-property, privacy, publicity, or other rights.</li></ul><p>We may investigate suspected misuse and suspend or terminate access where reasonably necessary to protect users, providers, or the service.</p></>,
  },
  {
    id: "ownership",
    title: "Ownership and feedback",
    content: <><p>Streak X, including its software, interface, branding, text, graphics, and original features, is owned by Streak X or its licensors and is protected by applicable intellectual-property laws. These Terms grant you a limited, personal, non-exclusive, non-transferable, revocable right to use the service while your account and subscription remain valid.</p><p>You retain ownership of information you provide. You grant us the limited rights necessary to host, process, and display that information to operate the service. If you send feedback or suggestions, you permit us to use them without restriction or compensation.</p></>,
  },
  {
    id: "third-parties",
    title: "Third-party services",
    content: <p>Streak X depends on services including Supabase, Vercel, Creem, transactional email infrastructure, TwitterAPI.io, and public X systems. Your use of third-party services may be governed by their terms. We are not responsible for third-party changes, outages, restrictions, content, or decisions outside our reasonable control.</p>,
  },
  {
    id: "availability",
    title: "Availability and changes",
    content: <><p>We aim to keep Streak X reliable, but we do not guarantee uninterrupted or error-free operation. We may maintain, modify, limit, suspend, or discontinue features when reasonably necessary. We may also impose or revise usage limits to protect service stability and provider capacity.</p><p>We will try to give reasonable notice before discontinuing the paid service as a whole, except where immediate action is required for security, law, provider restrictions, or circumstances outside our control.</p></>,
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: <><p>To the fullest extent permitted by law, Streak X is provided “as is” and “as available.” We disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising from course of dealing or usage.</p><p>Streaks, counts, reminders, and other information are productivity aids. We do not guarantee audience growth, engagement, revenue, account performance, or any particular result from using Streak X.</p></>,
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: <><p>To the fullest extent permitted by law, Streak X and its operators, suppliers, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenue, data, goodwill, or business opportunities arising from the service.</p><p>To the fullest extent permitted by law, our aggregate liability for claims relating to Streak X will not exceed the amount you paid for the service during the twelve months before the event giving rise to the claim. These limitations do not apply where liability cannot lawfully be limited.</p></>,
  },
  {
    id: "termination",
    title: "Suspension and termination",
    content: <><p>You may stop using Streak X at any time and may request account deletion through support. We may suspend or terminate access if you materially breach these Terms, create security or legal risk, fail to pay, misuse providers, or if continued service becomes unlawful or impractical.</p><p>Provisions that by their nature should survive termination remain effective, including payment obligations, ownership, disclaimers, liability limitations, and dispute provisions.</p></>,
  },
  {
    id: "law-disputes",
    title: "Applicable law and disputes",
    content: <><p>These Terms are governed by the laws applicable in the jurisdiction where the operator of Streak X is established, without regard to conflict-of-law principles. Before starting formal proceedings, you agree to contact us and attempt to resolve the dispute informally for at least 30 days.</p><p>Any dispute that cannot be resolved informally will be submitted to a court of competent jurisdiction, unless applicable consumer law gives you the right to bring a claim elsewhere. Nothing here limits rights that cannot be waived under applicable law.</p></>,
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    content: <p>We may update these Terms as the service or law changes. We will post the revised Terms and update the effective date. Material changes will apply prospectively, and we will provide additional notice where reasonably required. Continued use after updated Terms take effect constitutes acceptance.</p>,
  },
  {
    id: "contact",
    title: "Contact",
    content: <p>Questions, billing concerns, and legal notices may be sent to <a href="mailto:support@streakx.online">support@streakx.online</a>. Include your Streak X account email and enough information for us to understand the request.</p>,
  },
];

export default function TermsPage() {
  return <LegalPage eyebrow="THE RULES, WITHOUT THE MYSTERY." title="Terms of Service" summary="The practical terms for using Streak X and maintaining a paid subscription." effectiveDate="September 11, 2026" sections={sections} />;
}
