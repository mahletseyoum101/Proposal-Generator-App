import Image from "next/image";
import type { Proposal, TitledPoint } from "@/lib/types";
import { amountDue, categoryAmounts } from "@/lib/types";
import {
  WHAT_WE_DO,
  WHY_US,
  WHY_THAT_MATTERS,
  PROCESS_STEPS,
  INVESTMENT_PARAGRAPH,
  SAVINGS,
  PROMISE,
  agreementRows,
  AGREEMENT_NOTE,
} from "@/lib/agency-content";

function SectionHeading({ lead, rest }: { lead: string; rest: string }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
      <span className="text-dodo-gold">{lead} </span>
      <span className="text-dodo-ink">{rest}</span>
    </h2>
  );
}

function Section({
  id,
  children,
  tint = false,
}: {
  id?: string;
  children: React.ReactNode;
  tint?: boolean;
}) {
  return (
    <section
      id={id}
      className={`px-6 sm:px-12 py-16 border-b border-dodo-border ${tint ? "bg-dodo-cream" : "bg-white"}`}
    >
      <div className="max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

function NumberedGrid({ items }: { items: TitledPoint[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-dodo-border rounded-xl p-5">
          <span className="text-sm font-semibold text-dodo-gold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="font-semibold text-dodo-ink mt-1 mb-1">{item.title}</h3>
          <p className="text-dodo-muted leading-relaxed text-sm">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function ProposalTemplate({ proposal }: { proposal: Proposal }) {
  const c = proposal.content;
  const due = amountDue(proposal);
  const hasDeposit = proposal.deposit_percent > 0 && proposal.deposit_percent < 100;
  // Pin an explicit timeZone so server (UTC on Netlify) and client (visitor's local
  // timezone) always compute the same string — otherwise a date near a day boundary can
  // format to a different calendar day between the two, causing a hydration mismatch.
  const formattedDate = new Date(proposal.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const amounts = categoryAmounts(proposal.price_total, c.package_categories);
  const agreement = agreementRows(proposal.deposit_percent, proposal.revisions_rounds);

  return (
    <div className="bg-white text-dodo-body">
      {/* Cover */}
      <section className="px-6 sm:px-12 pt-20 pb-16 bg-dodo-cream border-b border-dodo-border text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <Image src="/dodo-logo.png" alt="Dodo Digital" width={80} height={122} priority className="mb-8" />
          <p className="text-sm font-semibold tracking-[0.2em] text-dodo-gold mb-4">
            CLIENT PROPOSAL
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold text-dodo-ink leading-tight mb-3 text-balance">
            {proposal.business_name}
          </h1>
          <p className="text-xl text-dodo-ink mb-2 text-balance">{c.project_title}</p>
          <p className="text-lg text-dodo-muted mb-8 max-w-xl text-balance">{c.footer_tagline}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {c.service_tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium tracking-wide uppercase text-dodo-gold-dark bg-white border border-dodo-border rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-x-10 gap-y-4 text-left w-full max-w-md bg-white border border-dodo-border rounded-2xl px-8 py-6">
            <div>
              <dt className="text-xs font-semibold tracking-widest text-dodo-gold">
                PREPARED FOR
              </dt>
              <dd className="text-dodo-ink font-medium">{proposal.client_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-widest text-dodo-gold">BUSINESS</dt>
              <dd className="text-dodo-ink font-medium">{proposal.business_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-widest text-dodo-gold">
                PREPARED BY
              </dt>
              <dd className="text-dodo-ink font-medium">Dodo Digital</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-widest text-dodo-gold">DATE</dt>
              <dd className="text-dodo-ink font-medium">{formattedDate}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* YOUR problem areas */}
      <Section>
        <SectionHeading lead="YOUR" rest="problem areas." />
        <p className="leading-relaxed mb-8">
          Systems are innately high-leverage. But that leverage can either work for you or against
          you. In your case, there are a few small, persistent problems that are currently limiting
          growth:
        </p>
        <NumberedGrid items={c.problem_areas} />
      </Section>

      {/* YOUR solution */}
      <Section tint>
        <SectionHeading lead="YOUR" rest="solution." />
        <p className="leading-relaxed mb-8">
          Solving the above is straightforward; we&apos;ve done so many times before. In practice,
          our solution is almost always a combination of content, design, and automation. Here&apos;s
          what that looks like for you:
        </p>
        <NumberedGrid items={c.solution_benefits} />
      </Section>

      {/* WHAT we do */}
      <Section>
        <SectionHeading lead="WHAT" rest="we do." />
        <p className="leading-relaxed mb-8">{WHAT_WE_DO.intro}</p>
        <div className="space-y-6">
          {WHAT_WE_DO.items.map((service, i) => (
            <div key={i} className="flex gap-5">
              <span className="text-2xl font-semibold text-dodo-gold w-12 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold text-dodo-ink mb-1">{service.title}</h3>
                <p className="text-dodo-muted leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY us */}
      <Section tint>
        <SectionHeading lead="WHY" rest="us?" />
        <p className="leading-relaxed mb-8">{WHY_US.intro}</p>
        <NumberedGrid items={WHY_US.items} />
      </Section>

      {/* WHY that matters to you */}
      <Section>
        <SectionHeading lead="WHY" rest="that matters to you." />
        <div className="space-y-5 mb-6">
          {WHY_THAT_MATTERS.items.map((item, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-dodo-gold font-semibold">{i + 1}</span>
              <div>
                <h3 className="font-semibold text-dodo-ink mb-1">{item.title}</h3>
                <p className="text-dodo-muted leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="font-medium text-dodo-ink">{WHY_THAT_MATTERS.closing}</p>
      </Section>

      {/* YOUR recommended package */}
      <Section tint>
        <SectionHeading lead="YOUR" rest="recommended package." />
        <div className="bg-white border border-dodo-gold rounded-2xl p-8">
          <p className="text-center text-xl font-semibold text-dodo-ink mb-8">
            {proposal.package_name}
          </p>
          <p className="font-medium text-dodo-ink mb-4">What&apos;s included:</p>
          <div className="grid sm:grid-cols-2 gap-8">
            {c.package_categories.map((cat, i) => (
              <div key={i}>
                <h4 className="font-semibold text-dodo-gold-dark mb-3">{cat.title}</h4>
                <ul className="space-y-2">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-dodo-gold shrink-0">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHAT working with us looks like */}
      <Section>
        <SectionHeading lead="WHAT" rest="working with us looks like." />
        <div className="grid sm:grid-cols-2 gap-5">
          {PROCESS_STEPS.map((step, i) => (
            <div key={i} className="border border-dodo-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-dodo-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold text-dodo-ink">{step.title}</h3>
              </div>
              <p className="text-sm text-dodo-body leading-relaxed mb-3">{step.whatHappens}</p>
              <p className="text-sm text-dodo-gold-dark leading-relaxed">
                <span className="font-medium">Why it matters: </span>
                {step.whyItMatters}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHAT you're investing */}
      <Section tint>
        <SectionHeading lead="WHAT" rest="you're investing." />
        <div className="bg-white border border-dodo-border rounded-2xl overflow-hidden mb-6">
          {c.package_categories.map((cat, i) => (
            <div
              key={i}
              className="flex justify-between px-6 py-3 border-b border-dodo-border last:border-b-0"
            >
              <span className="text-dodo-body">{cat.title}</span>
              <span className="font-medium text-dodo-ink">${amounts[i].toLocaleString("en-US")}</span>
            </div>
          ))}
          <div className="flex justify-between px-6 py-4 bg-dodo-cream">
            <span className="font-semibold text-dodo-ink">Total Investment</span>
            <span className="font-semibold text-dodo-ink">
              ${proposal.price_total.toLocaleString("en-US")}
            </span>
          </div>
        </div>
        <p className="leading-relaxed mb-4">{INVESTMENT_PARAGRAPH}</p>
        {hasDeposit ? (
          <p className="text-dodo-muted">
            A {proposal.deposit_percent}% deposit (${due.toLocaleString("en-US")}) secures your project
            start date, with the balance due upon delivery.
          </p>
        ) : (
          <p className="text-dodo-muted">Full payment secures your project start date.</p>
        )}
      </Section>

      {/* WHAT this saves you */}
      <Section>
        <SectionHeading lead="WHAT" rest="this saves you." />
        <p className="leading-relaxed mb-6">{SAVINGS.paragraph}</p>
        <ul className="space-y-2 mb-8">
          {SAVINGS.benefits.map((benefit, i) => (
            <li key={i} className="flex gap-3 font-medium text-dodo-ink">
              <span className="text-dodo-gold">&#10003;</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4">You won&apos;t have to wonder:</p>
        <ul className="space-y-2 mb-6">
          {SAVINGS.questions.map((q, i) => (
            <li key={i} className="italic text-dodo-muted">
              &ldquo;{q}&rdquo;
            </li>
          ))}
        </ul>
        <p className="leading-relaxed">{SAVINGS.closing}</p>
      </Section>

      {/* THE Dodo Digital promise */}
      <Section tint>
        <SectionHeading lead="THE" rest="Dodo Digital promise." />
        <p className="leading-relaxed mb-4">{PROMISE.paragraph}</p>
        <p className="leading-relaxed mb-4">{PROMISE.guarantee}</p>
        <p className="font-medium text-dodo-ink">{PROMISE.tagline}</p>
      </Section>

      {/* READY to get started */}
      <Section>
        <SectionHeading lead="READY" rest="to get started?" />
        <p className="leading-relaxed mb-8">
          If you&apos;re ready to move forward, the next step is simple &mdash; sign below to lock
          in your package and delivery timeline.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "1", t: "Sign the proposal", d: "Review the details above and add your signature." },
            { n: "2", t: "Secure your spot", d: hasDeposit ? `Pay the ${proposal.deposit_percent}% deposit to lock in your start date.` : "Complete payment to lock in your start date." },
            { n: "3", t: "We get to work", d: "We'll send onboarding details and begin the project." },
          ].map((step) => (
            <div key={step.n} className="bg-dodo-cream border border-dodo-border rounded-xl p-5">
              <span className="text-dodo-gold font-semibold">{step.n}</span>
              <h4 className="font-semibold text-dodo-ink mt-1 mb-1">{step.t}</h4>
              <p className="text-sm text-dodo-muted leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* THE agreement, at a glance */}
      <Section tint>
        <SectionHeading lead="THE" rest="agreement, at a glance." />
        <p className="leading-relaxed mb-6">
          Here&apos;s a plain-language summary of how we&apos;ll work together. A complete Services
          Agreement will be provided separately for signature before work begins.
        </p>
        <div className="bg-white border border-dodo-border rounded-2xl overflow-hidden mb-4">
          {agreement.map((row, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:gap-6 px-6 py-4 border-b border-dodo-border last:border-b-0"
            >
              <span className="font-semibold text-dodo-ink sm:w-40 shrink-0">{row.term}</span>
              <span className="text-dodo-body text-sm leading-relaxed">{row.detail}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-dodo-muted">{AGREEMENT_NOTE}</p>
      </Section>

      {/* Closing */}
      <section className="px-6 sm:px-12 py-16 bg-dodo-ink text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-dodo-gold mb-4">THANK YOU</p>
          <p className="text-xl text-white leading-relaxed mb-8 max-w-xl text-balance">
            {c.closing_message}
          </p>
          <Image src="/dodo-logo.png" alt="Dodo Digital" width={48} height={73} className="mb-4 opacity-90" />
          <p className="text-white/60 text-sm">
            dododigital.com &bull; {c.contact_email} &bull; {c.contact_phone}
          </p>
        </div>
      </section>
    </div>
  );
}
