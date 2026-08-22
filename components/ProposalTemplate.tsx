import Image from "next/image";
import type { Proposal } from "@/lib/types";
import { amountDue } from "@/lib/types";

function SectionNumber({ n }: { n: string }) {
  return (
    <span className="inline-block text-sm font-semibold tracking-widest text-dodo-gold">
      {n}
    </span>
  );
}

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <SectionNumber n={n} />
      <h2 className="text-2xl sm:text-3xl font-semibold text-dodo-ink">{title}</h2>
    </div>
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

export function ProposalTemplate({ proposal }: { proposal: Proposal }) {
  const c = proposal.content;
  const due = amountDue(proposal);
  const hasDeposit = proposal.deposit_percent > 0 && proposal.deposit_percent < 100;
  const formattedDate = new Date(proposal.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white text-dodo-body">
      {/* Cover */}
      <section className="px-6 sm:px-12 pt-20 pb-16 bg-dodo-cream border-b border-dodo-border text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <Image src="/dodo-logo.png" alt="Dodo Digital" width={96} height={146} priority className="mb-8" />
          <p className="text-sm font-semibold tracking-[0.2em] text-dodo-gold mb-4">
            CLIENT PROPOSAL
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold text-dodo-ink leading-tight mb-4 text-balance">
            {c.headline}
          </h1>
          <p className="text-lg text-dodo-muted mb-8 max-w-xl text-balance">{c.subheadline}</p>
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

      {/* 01 Opportunity */}
      <Section>
        <SectionHeading n="01" title="The Opportunity" />
        <p className="text-lg leading-relaxed mb-6">{c.opportunity_intro}</p>
        <p className="font-medium text-dodo-ink mb-3">Right now, you may be losing potential customers because:</p>
        <ul className="space-y-2 mb-8">
          {c.pain_points.map((point, i) => (
            <li key={i} className="flex gap-3 leading-relaxed">
              <span className="text-dodo-gold mt-1">&bull;</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="text-lg leading-relaxed font-medium text-dodo-ink">{c.solution_paragraph}</p>
      </Section>

      {/* 02 Achieve */}
      <Section tint>
        <SectionHeading n="02" title="What We'll Help You Achieve" />
        <div className="grid sm:grid-cols-2 gap-6">
          {c.goals.map((goal, i) => (
            <div key={i} className="bg-white border border-dodo-border rounded-xl p-6">
              <h3 className="font-semibold text-dodo-ink mb-2">{goal.title}</h3>
              <p className="text-dodo-muted leading-relaxed">{goal.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 Services */}
      <Section>
        <SectionHeading n="03" title="What We Do" />
        <div className="space-y-6">
          {c.services.map((service, i) => (
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

      {/* 04 Package */}
      <Section tint>
        <SectionHeading n="04" title="Your Recommended Package" />
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

      {/* 05 Why this package */}
      <Section>
        <SectionHeading n="05" title="Why This Package" />
        <p className="leading-relaxed mb-6">
          You don&apos;t need to invest in everything at once. This package focuses on the highest-impact areas first:
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-8 font-semibold text-dodo-ink">
          {c.why_package_flow.map((step, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="bg-dodo-cream border border-dodo-border rounded-full px-4 py-1.5">
                {step}
              </span>
              {i < c.why_package_flow.length - 1 && <span className="text-dodo-gold">&rarr;</span>}
            </span>
          ))}
        </div>
        <p className="leading-relaxed">{c.why_package_paragraph}</p>
      </Section>

      {/* 06 Investment */}
      <Section tint>
        <SectionHeading n="06" title="The Investment" />
        <p className="leading-relaxed mb-6">
          Instead of purchasing each service separately, you&apos;re getting everything together as one streamlined package.
        </p>
        <div className="bg-white border border-dodo-border rounded-2xl overflow-hidden mb-6">
          {c.package_categories.map((cat, i) => (
            <div
              key={i}
              className="flex justify-between px-6 py-3 border-b border-dodo-border last:border-b-0"
            >
              <span className="text-dodo-body">{cat.title}</span>
              <span className="font-medium text-dodo-ink">Included</span>
            </div>
          ))}
          <div className="flex justify-between px-6 py-3 border-b border-dodo-border">
            <span className="text-dodo-body">Revisions</span>
            <span className="font-medium text-dodo-ink">{proposal.revisions_rounds} rounds</span>
          </div>
          <div className="flex justify-between px-6 py-3 border-b border-dodo-border">
            <span className="text-dodo-body">Delivery Timeline</span>
            <span className="font-medium text-dodo-ink">{proposal.delivery_timeline}</span>
          </div>
          <div className="flex justify-between px-6 py-4 bg-dodo-cream">
            <span className="font-semibold text-dodo-ink">Total Investment</span>
            <span className="font-semibold text-dodo-ink">
              ${proposal.price_total.toLocaleString()}
            </span>
          </div>
        </div>
        {hasDeposit ? (
          <p className="text-dodo-muted">
            A {proposal.deposit_percent}% deposit (${due.toLocaleString()}) secures your project start
            date, with the balance due upon delivery.
          </p>
        ) : (
          <p className="text-dodo-muted">Full payment secures your project start date.</p>
        )}
      </Section>

      {/* 07 Savings */}
      <Section>
        <SectionHeading n="07" title="What This Saves You" />
        <p className="leading-relaxed mb-3">
          Hiring separate people for each of these services means:
        </p>
        <ul className="space-y-2 mb-8">
          {c.savings_points.map((point, i) => (
            <li key={i} className="flex gap-3 leading-relaxed">
              <span className="text-dodo-gold mt-1">&bull;</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="leading-relaxed mb-4">
          With Dodo Digital, one team handles your entire digital experience from start to finish.
        </p>
        <ul className="space-y-2">
          {c.savings_benefits.map((benefit, i) => (
            <li key={i} className="flex gap-3 font-medium text-dodo-ink">
              <span className="text-dodo-gold">&#10003;</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 08 Process */}
      <Section tint>
        <SectionHeading n="08" title="Our Process" />
        <div className="space-y-6">
          {c.process_steps.map((step, i) => (
            <div key={i} className="flex gap-5">
              <span className="text-2xl font-semibold text-dodo-gold w-12 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold text-dodo-ink mb-1">{step.title}</h3>
                <p className="text-dodo-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 09 Expectations */}
      <Section>
        <SectionHeading n="09" title="What You Can Expect" />
        <p className="mb-4">You won&apos;t have to wonder:</p>
        <ul className="space-y-2 mb-6">
          {c.expectation_questions.map((q, i) => (
            <li key={i} className="italic text-dodo-muted">
              &ldquo;{q.replace(/^["“]|["”]$/g, "")}&rdquo;
            </li>
          ))}
        </ul>
        <p className="leading-relaxed">
          We&apos;ll help turn those questions into a clear, professional digital presence that works
          for you around the clock.
        </p>
      </Section>

      {/* 10 Promise */}
      <Section tint>
        <SectionHeading n="10" title="The Dodo Digital Promise" />
        <p className="leading-relaxed mb-4">{c.promise_paragraph}</p>
        <p className="font-medium text-dodo-ink">
          No unnecessary complexity. No confusing packages. No agency jargon. Just clear
          deliverables and professional execution.
        </p>
      </Section>

      {/* 11 Ready to get started */}
      <Section>
        <SectionHeading n="11" title="Ready To Get Started?" />
        <p className="leading-relaxed mb-8">
          If you&apos;re ready to move forward, the next step is simple &mdash; sign below to lock in your
          package and delivery timeline.
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

      {/* Closing */}
      <section className="px-6 sm:px-12 py-16 bg-dodo-ink text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-dodo-gold mb-4">THANK YOU</p>
          <p className="text-xl text-white leading-relaxed mb-8 max-w-xl text-balance">
            {c.closing_message}
          </p>
          <Image src="/dodo-logo.png" alt="Dodo Digital" width={56} height={85} className="mb-4 opacity-90" />
          <p className="text-white/60 text-sm">dododigital.com</p>
        </div>
      </section>
    </div>
  );
}
