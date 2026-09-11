import Link from "next/link";
import type { ReactNode } from "react";
import { Brand, PublicHeader } from "@/components/ui";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export default function LegalPage({
  eyebrow,
  title,
  summary,
  effectiveDate,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <header className="legal-hero">
          <span className="eyebrow"><span className="blue-dot" /> {eyebrow}</span>
          <h1>{title}<span className="blue-text">.</span></h1>
          <p>{summary}</p>
          <span className="legal-effective">Effective {effectiveDate}</span>
        </header>

        <div className="legal-layout">
          <aside className="legal-nav" aria-label={`${title} sections`}>
            <span>ON THIS PAGE</span>
            <nav>
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <b>{String(index + 1).padStart(2, "0")}</b>{section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="legal-content">
            {sections.map((section, index) => (
              <section id={section.id} key={section.id}>
                <span className="legal-section-number">{String(index + 1).padStart(2, "0")} /</span>
                <h2>{section.title}</h2>
                <div>{section.content}</div>
              </section>
            ))}
            <div className="legal-contact-card">
              <span className="blue-dot" />
              <div><strong>{title === "Terms of Service" ? "Questions about these terms?" : "Questions about this policy?"}</strong><p>Email us at <a href="mailto:support@streakx.online">support@streakx.online</a>.</p></div>
            </div>
          </article>
        </div>
      </main>

      <footer className="landing-footer expanded-footer legal-footer">
        <div><Brand /><p>A little progress. Every day.</p></div>
        <nav aria-label="Legal navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@streakx.online">Support</a>
        </nav>
        <span>© 2026 Streak X. All rights reserved.</span>
      </footer>
    </>
  );
}
