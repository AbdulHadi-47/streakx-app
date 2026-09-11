import Link from "next/link";
import { Brand, Icon, PublicHeader } from "@/components/ui";
import { GoalProgress, StreakCard } from "@/components/ProgressCards";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { DEMO_TODAY, demoActivity } from "@/lib/activity/demo";
import PricingCards from "@/components/PricingCards";

// Marketing content is independent of sessions and can be built ahead of time.
export const dynamic = "error";

const faqs = [
  {
    question: "What does the activity heat map show?",
    answer: "Each square represents a day in your time zone. Brighter blue means more saved activity, and outlined squares mean both daily goals were completed. Filter by posts or replies, explore up to a year, and select a square for the daily counts. Days without a saved refresh appear as dashed squares.",
  },
  {
    question: "How does Streak X track my activity?",
    answer: "Connect your X username, then use Refresh progress on your dashboard. Streak X checks your public posts and replies for the current day and compares them with your goals.",
  },
  {
    question: "What counts toward my streak?",
    answer: "You add a day to your streak when you meet both your daily post goal and your daily reply goal. Reposts do not count as original posts. Your current streak and personal best appear on your dashboard.",
  },
  {
    question: "How often can I refresh my progress?",
    answer: "You have three refreshes per day. Your dashboard shows how many are left and when you last refreshed, so you can check after you’ve finished a round of posting and replying.",
  },
  {
    question: "When does a new day begin?",
    answer: "Daily activity and refresh allowances reset at midnight in your detected time zone. Both goals need to be completed within your local day, and your progress syncs automatically at noon and just before midnight.",
  },
  {
    question: "Do I need to share my X password?",
    answer: "No. You connect with your X username, and Streak X reads public activity. Your Streak X account has its own email and password.",
  },
  {
    question: "Does Streak X write or publish posts for me?",
    answer: "You post and reply directly on X. Streak X is your daily check-in for goals, progress, and consistency.",
  },
  {
    question: "How much does Streak X cost?",
    answer: "Streak X Pro is $9.99 per month or $99.99 per year. The yearly plan saves almost two full months, and billing can be managed through Creem.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="landing">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="blue-dot" /> A LITTLE PROGRESS. EVERY DAY.</span>
            <h1>Show up.<br />Build <span className="muted-heading">momentum.</span><br />Keep going<span className="blue-text">.</span></h1>
            <p>Turn your daily activity on X into a habit that sticks. Set your goals, track your progress, and make every day count.</p>
            <div className="hero-actions">
              <Link className="button hero-cta" href="/signup">Start your streak <Icon name="arrow" /></Link>
              <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <span className="hero-footnote">Your goals. Your pace. Your next chapter.</span>
          </div>
          <div className="hero-preview">
            <div className="preview-heading"><span><span className="blue-dot" /> THE DAILY CHECK-IN</span><span>EXAMPLE</span></div>
            <StreakCard current={7} longest={12} completed={false} />
            <div className="preview-goals">
              <GoalProgress label="Posts" icon="post" count={3} goal={3} />
              <GoalProgress label="Replies" icon="reply" count={7} goal={10} />
            </div>
            <div className="preview-note"><Icon name="target" /> Just 3 more replies. You’ve got this.</div>
          </div>
        </section>

        <div className="product-principles" aria-label="Streak X at a glance">
          <span>MADE FOR YOUR DAILY ROUTINE</span>
          <div><Icon name="post" /><span>Intentional posts</span></div>
          <div><Icon name="reply" /><span>Real conversations</span></div>
          <div><Icon name="flame" /><span>Lasting consistency</span></div>
        </div>

        <section id="activity" className="heatmap-showcase" aria-labelledby="heatmap-showcase-title">
          <div className="marketing-section-heading">
            <div><span className="eyebrow">YOUR CONSISTENCY, IN FULL COLOR</span><h2 id="heatmap-showcase-title">Small squares.<br /><span className="muted-heading">A bigger picture.</span></h2></div>
            <p>See your posts, replies, and completed goals come together, day by day. Explore your activity heat map and watch a habit take shape.</p>
          </div>
          <ActivityHeatmap rows={demoActivity} today={DEMO_TODAY} demo />
        </section>

        <section id="features" className="feature-section" aria-labelledby="features-title">
          <div className="marketing-section-heading">
            <div>
              <span className="eyebrow">MAKE SHOWING UP SECOND NATURE</span>
              <h2 id="features-title">Big ambitions.<br /><span className="muted-heading">Small, daily actions.</span></h2>
            </div>
            <p>It’s easy to have a productive day on X. The real challenge is coming back tomorrow. Give yourself a clear target and a little reason to keep going.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-goals">
              <div className="feature-card-copy">
                <span className="small-icon"><Icon name="target" /></span>
                <h3>Know what “done” looks like.</h3>
                <p>A daily goal for posts. A daily goal for replies. Two simple targets that turn “I should be more active” into something you can actually finish.</p>
              </div>
              <div className="feature-demo" aria-label="Example of completed daily goals">
                <div className="demo-heading"><span>Today’s goals</span><span className="example-label">EXAMPLE</span></div>
                <div className="demo-goal-row"><span><Icon name="post" /> Publish your posts</span><strong>3 / 3 <Icon name="check" /></strong></div>
                <div className="demo-goal-row"><span><Icon name="reply" /> Join the conversation</span><strong>10 / 10 <Icon name="check" /></strong></div>
                <div className="demo-complete"><Icon name="check" /> Both goals complete. Your day counts.</div>
              </div>
            </article>
            <article className="feature-card feature-streak">
              <div className="feature-card-copy">
                <span className="small-icon"><Icon name="flame" /></span>
                <h3>See your effort add up.</h3>
                <p>One completed day becomes two. Then three. Your current streak makes consistency visible, and your personal best gives you something to work toward.</p>
              </div>
              <div className="streak-demo" aria-label="Example: a 14-day streak and a 21-day personal best">
                <span className="example-label">EXAMPLE STREAK</span>
                <div><Icon name="flame" /><strong>14<span>days of showing up</span></strong></div>
                <span className="demo-best"><Icon name="trophy" /> Personal best <b>21 days</b></span>
              </div>
            </article>
            <article className="feature-card feature-small">
              <span className="small-icon"><Icon name="refresh" /></span>
              <div><h3>A check-in, on your terms.</h3><p>Refresh after you’ve been active. See your latest counts, your remaining refreshes, and exactly when you last checked.</p></div>
            </article>
            <article className="feature-card feature-small">
              <span className="small-icon x-symbol">𝕏</span>
              <div><h3>Your account. Connected simply.</h3><p>Bring your X username. Keep posting and replying where you already do. There’s no X password to hand over.</p></div>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works" aria-labelledby="how-title">
          <div className="how-heading">
            <span className="eyebrow">LESS OVERTHINKING. MORE SHOWING UP.</span>
            <h2 id="how-title">Your next streak starts with three steps.</h2>
          </div>
          <div className="steps-grid">
            <article><span className="step-number">01 /</span><Icon name="target" /><h3>Set your pace</h3><p>Create your account and choose a daily post and reply goal that fits into your life.</p></article>
            <article><span className="step-number">02 /</span><span className="x-symbol">𝕏</span><h3>Make it count</h3><p>Connect your X username. Post, join conversations, and refresh to check your progress.</p></article>
            <article><span className="step-number">03 /</span><Icon name="flame" /><h3>Keep the streak</h3><p>Hit both goals before midnight in your time zone. Come back tomorrow and build on what you started.</p></article>
          </div>
        </section>

        <section className="audience-section" aria-labelledby="audience-title">
          <div className="marketing-section-heading">
            <div><span className="eyebrow">FOR PEOPLE WITH SOMETHING TO SAY</span><h2 id="audience-title">Find your people.<br /><span className="muted-heading">Keep showing up for them.</span></h2></div>
            <p>Whether you’re sharing your work, building a business, or finding your voice, a repeatable routine gives you a place to start.</p>
          </div>
          <div className="audience-grid">
            <article><span className="audience-tag">01 — CREATORS</span><h3>Make room for your ideas.</h3><p>Build a habit of sharing what you know and connecting with the people who care about it.</p><span className="audience-bottom">A little creativity, every day.</span></article>
            <article><span className="audience-tag">02 — BUILDERS</span><h3>Bring people along.</h3><p>Share what you’re making, talk about what you’re learning, and make building in public a daily practice.</p><span className="audience-bottom">Progress worth sharing.</span></article>
            <article><span className="audience-tag">03 — STARTING FRESH</span><h3>Find your rhythm.</h3><p>Start with a manageable goal. A few thoughtful posts and replies are enough to begin.</p><span className="audience-bottom">Your day one is waiting.</span></article>
          </div>
        </section>

        <section className="consistency-statement" aria-label="Our approach">
          <Icon name="flame" />
          <p>You don’t need a perfect posting strategy.<br />You need a reason to <span>show up tomorrow.</span></p>
          <span className="eyebrow">THAT’S WHAT STREAK X IS HERE FOR.</span>
        </section>

        <section id="pricing" className="landing-pricing" aria-labelledby="pricing-title">
          <div className="marketing-section-heading">
            <div><span className="eyebrow">ONE PLAN. YOUR CHOICE OF RHYTHM.</span><h2 id="pricing-title">Build momentum.<br /><span className="muted-heading">Keep it affordable.</span></h2></div>
            <p>Everything you need to make consistency visible, with simple monthly or yearly billing.</p>
          </div>
          <PricingCards />
        </section>

        <section id="faq" className="faq-section" aria-labelledby="faq-title">
          <div className="faq-heading">
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <h2 id="faq-title">Good questions.<br /><span className="muted-heading">Simple answers.</span></h2>
            <p>A closer look at how your goals, activity, and streak work together.</p>
          </div>
          <div className="faq-list">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="faq-item">
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing-cta" aria-labelledby="closing-title">
          <span className="eyebrow"><span className="blue-dot" /> EVERY STREAK STARTS AT ONE</span>
          <h2 id="closing-title">Make today <span className="muted-heading">day one.</span></h2>
          <p>You’ve got something to say. Build the habit of saying it.</p>
          <Link href="/signup" className="button">Start your streak <Icon name="arrow" /></Link>
          <span className="closing-note">Set a goal. Show up. Repeat.</span>
        </section>
      </main>
      <footer className="landing-footer expanded-footer">
        <div><Brand /><p>A little progress. Every day.</p></div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQs</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/dashboard">Open app <Icon name="arrow" /></Link>
        </nav>
        <span>Built for the ones who keep showing up.</span>
      </footer>
    </>
  );
}
