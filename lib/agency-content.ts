/**
 * Fixed Dodo Digital company copy shared by every proposal. Only the sections that are
 * genuinely client-specific are drafted per-proposal by AI (see lib/ai.ts) —
 * everything here describes the agency itself and stays consistent across proposals.
 */

export const WHAT_WE_DO = {
  intro: "Four core services, built to work together, so your online presence grows as one connected system rather than a set of disconnected tools.",
  items: [
    { title: "Content & Social Media", description: "Branded posts, story designs, and captions that keep your business visible and consistent across platforms." },
    { title: "Short-Form Video", description: "Scroll-stopping edits for Reels, TikTok, and Shorts, complete with captions, music, transitions, and platform-ready formatting." },
    { title: "Simple Business Websites", description: "A clean, mobile-friendly website that clearly explains what you offer and makes it easy to get in touch." },
    { title: "AI Automation", description: "Smart, simple automations for chat responses, lead follow-up, and appointment reminders that save you hours every week." },
  ],
};

export const WHY_US = {
  intro: "Small businesses trust Dodo Digital to modernize their online presence without the overhead of a full agency. Our systems have helped local businesses save hours every week and turn more visitors into paying customers.",
  items: [
    { title: "Built For Small Business", description: "We specialize exclusively in small and local businesses, not enterprise accounts. Every system we build is sized to your team, timeline, and budget." },
    { title: "Content + Automation, One Roof", description: "Most agencies pick a lane: content or tech. We combine social content, video, web, and AI automation into a single coordinated system." },
    { title: "Founder-Led Delivery", description: "You work directly with the people building your systems. No account managers, no hand-offs, no delays." },
    { title: "Results, Not Vanity Metrics", description: "We care about the numbers that matter: leads, bookings, and revenue, not just likes and impressions." },
  ],
};

export const WHY_THAT_MATTERS = {
  items: [
    { title: "We keep it simple.", description: "Small businesses don't need enterprise complexity. We translate what actually works into a system you can run without a marketing degree." },
    { title: "We focus on outcomes.", description: "Content and automation are tools, not the goal. Everything we build is judged by whether it brings you more customers and gives you back time." },
    { title: "We treat AI as infrastructure, not a gimmick.", description: "The automations we build handle real tasks, like bookings, FAQs, and follow-ups, reliably and quietly in the background, not as a flashy add-on." },
  ],
  closing: "Put simply, when you work with Dodo Digital, you get a team that treats your business like their own.",
};

export const PROCESS_STEPS = [
  { title: "Discovery & Audit", whatHappens: "We review your current online presence, content, website, and any manual processes eating up your time.", whyItMatters: "This ensures we build around your real bottlenecks, not guesses." },
  { title: "Content & Brand Direction", whatHappens: "We map your voice, visuals, and messaging so every post, video, and page feels consistent.", whyItMatters: "Consistency is what builds trust, and trust is what converts." },
  { title: "Build & Design", whatHappens: "We produce your content calendar, edit your videos, and build your website.", whyItMatters: "You get tangible, usable assets, not just a plan." },
  { title: "Automation Setup", whatHappens: "We configure your AI automations, like inquiry replies, reminders, and lead capture, and connect them to how you already work.", whyItMatters: "This is where you actually get your time back." },
  { title: "Review & Launch", whatHappens: "You review everything, we make your included revisions, then we launch.", whyItMatters: "Nothing goes live until you're confident in it." },
  { title: "Handover & Support", whatHappens: "We deliver a simple guide so you can manage things going forward, with support available if you need us.", whyItMatters: "You own the system. We're not a dependency." },
];

export const INVESTMENT_PARAGRAPH =
  "The investment for this project should be weighed against what it unlocks: consistent content without hiring a full team, a website that converts visitors into customers, and automations that save you hours every week. This isn't a cost, it's the highest-leverage investment your business can make right now, with a payback period measured in weeks, not months.";

export const SAVINGS = {
  paragraph: "Hiring separate people for content, video editing, website development, and automation means more communication, more coordination, inconsistent styles, and more time spent managing projects instead of running your business.",
  benefits: ["One point of contact", "One consistent brand", "One streamlined process"],
  questions: [
    "What should I post?",
    "How should my business look online?",
    "How do I make my videos more professional?",
    "How can I keep up without hiring a full team?",
  ],
  closing: "We'll help turn those questions into a clear, professional digital presence that works for you around the clock.",
};

export const PROMISE = {
  paragraph: "We're a growing digital service brand, so our goal is simple: do excellent work, communicate clearly, and make sure you feel confident with what you're paying for.",
  guarantee: "If something doesn't meet the agreed requirements, we'll work with you to correct it within the scope of the project.",
  tagline: "No unnecessary complexity. No confusing packages. No agency jargon. Just clear deliverables and professional execution.",
};

export function agreementRows(depositPercent: number, revisionsRounds: number) {
  return [
    { term: "Term", detail: "Engagement runs for the agreed project scope. Ongoing support renews month-to-month unless either party gives 30 days' written notice." },
    { term: "Payment", detail: `${depositPercent}% deposit to begin, balance due upon delivery. Late payments may accrue interest per the full agreement.` },
    { term: "Revisions", detail: `${revisionsRounds} round${revisionsRounds === 1 ? "" : "s"} of revisions are included per deliverable, as outlined in your package.` },
    { term: "Ownership", detail: "Final deliverables (content, website, automations) become client property upon full payment. Dodo Digital retains rights to its own tools, templates, and frameworks." },
    { term: "Confidentiality", detail: "Both parties agree to protect shared business information with reasonable care." },
    { term: "Client Responsibilities", detail: "Timely access to relevant accounts, assets, and feedback; a single point of contact for approvals." },
  ];
}

export const AGREEMENT_NOTE =
  "This summary is provided for convenience and does not replace the full Services Agreement, which governs the engagement.";
