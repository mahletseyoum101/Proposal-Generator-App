"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Proposal } from "@/lib/types";
import { ProposalTemplate } from "@/components/ProposalTemplate";
import { Field, TextAreaField, StringList, TitledList, CategoryList } from "./FieldControls";

export function ProposalEditor({ proposal: initial }: { proposal: Proposal }) {
  const router = useRouter();
  const [proposal, setProposal] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const [publishedUrl, setPublishedUrl] = useState<string | null>(
    initial.status !== "draft" ? `${siteUrl}/p/${initial.public_token}` : null
  );

  function updateField<K extends keyof Proposal>(key: K, value: Proposal[K]) {
    setProposal((p) => ({ ...p, [key]: value }));
  }

  function updateContent<K extends keyof Proposal["content"]>(
    key: K,
    value: Proposal["content"][K]
  ) {
    setProposal((p) => ({ ...p, content: { ...p.content, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: proposal.client_name,
          businessName: proposal.business_name,
          clientEmail: proposal.client_email,
          packageName: proposal.package_name,
          priceTotal: proposal.price_total,
          depositPercent: proposal.deposit_percent,
          revisionsRounds: proposal.revisions_rounds,
          deliveryTimeline: proposal.delivery_timeline,
          content: proposal.content,
        }),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      await handleSave();
      const res = await fetch(`/api/proposals/${proposal.id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      setPublishedUrl(`${siteUrl}/p/${data.publicToken}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  const c = proposal.content;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Editor */}
      <div>
        <Link href="/dashboard" className="text-sm text-dodo-muted hover:text-dodo-ink">
          &larr; Back to proposals
        </Link>
        <h1 className="text-2xl font-semibold text-dodo-ink mt-2 mb-1">Review &amp; edit</h1>
        <p className="text-dodo-muted mb-6">
          Edit anything below — the preview on the right updates as you type.
        </p>

        {publishedUrl && (
          <div className="bg-dodo-cream border border-dodo-border rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-dodo-ink mb-1">Shareable link</p>
            <a href={publishedUrl} target="_blank" rel="noreferrer" className="text-sm text-dodo-gold-dark break-all">
              {publishedUrl}
            </a>
          </div>
        )}

        <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Deal details</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client name" value={proposal.client_name} onChange={(v) => updateField("client_name", v)} />
              <Field label="Business name" value={proposal.business_name} onChange={(v) => updateField("business_name", v)} />
              <Field label="Package name" value={proposal.package_name} onChange={(v) => updateField("package_name", v)} />
              <Field label="Price ($)" value={String(proposal.price_total)} onChange={(v) => updateField("price_total", Number(v) || 0)} />
              <Field label="Deposit %" value={String(proposal.deposit_percent)} onChange={(v) => updateField("deposit_percent", Number(v) || 0)} />
              <Field label="Revision rounds" value={String(proposal.revisions_rounds)} onChange={(v) => updateField("revisions_rounds", Number(v) || 0)} />
              <Field label="Delivery timeline" value={proposal.delivery_timeline} onChange={(v) => updateField("delivery_timeline", v)} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Cover</h2>
            <Field label="Headline" value={c.headline} onChange={(v) => updateContent("headline", v)} />
            <Field label="Subheadline" value={c.subheadline} onChange={(v) => updateContent("subheadline", v)} />
            <StringList label="Service tags" items={c.service_tags} onChange={(v) => updateContent("service_tags", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">01 — The Opportunity</h2>
            <TextAreaField label="Intro" value={c.opportunity_intro} onChange={(v) => updateContent("opportunity_intro", v)} />
            <StringList label="Pain points" items={c.pain_points} onChange={(v) => updateContent("pain_points", v)} />
            <TextAreaField label="Solution paragraph" value={c.solution_paragraph} onChange={(v) => updateContent("solution_paragraph", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">02 — What We&apos;ll Help You Achieve</h2>
            <TitledList label="Goals" items={c.goals} onChange={(v) => updateContent("goals", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">03 — What We Do</h2>
            <TitledList label="Services" items={c.services} onChange={(v) => updateContent("services", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">04 — Package</h2>
            <CategoryList label="Included categories" categories={c.package_categories} onChange={(v) => updateContent("package_categories", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">05 — Why This Package</h2>
            <TextAreaField label="Paragraph" value={c.why_package_paragraph} onChange={(v) => updateContent("why_package_paragraph", v)} />
            <StringList label="Value flow" items={c.why_package_flow} onChange={(v) => updateContent("why_package_flow", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">07 — What This Saves You</h2>
            <StringList label="Friction points" items={c.savings_points} onChange={(v) => updateContent("savings_points", v)} />
            <StringList label="Benefits (3)" items={c.savings_benefits} onChange={(v) => updateContent("savings_benefits", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">08 — Our Process</h2>
            <TitledList label="Steps" items={c.process_steps} onChange={(v) => updateContent("process_steps", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">09 — What You Can Expect</h2>
            <StringList label="Questions" items={c.expectation_questions} onChange={(v) => updateContent("expectation_questions", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">10 — The Promise</h2>
            <TextAreaField label="Paragraph" value={c.promise_paragraph} onChange={(v) => updateContent("promise_paragraph", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Closing</h2>
            <TextAreaField label="Thank-you message" value={c.closing_message} onChange={(v) => updateContent("closing_message", v)} />
          </section>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-dodo-border">
          <button
            onClick={handleSave}
            disabled={saving || publishing}
            className="border border-dodo-border rounded-full px-5 py-2.5 font-medium text-dodo-ink hover:border-dodo-gold transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="bg-dodo-ink text-white rounded-full px-6 py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {publishing ? "Publishing…" : publishedUrl ? "Republish" : "Publish"}
          </button>
          {savedAt && !publishing && (
            <span className="text-sm text-dodo-muted">Saved {savedAt.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="hidden lg:block">
        <div className="sticky top-6 border border-dodo-border rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-sm">
          <ProposalTemplate proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
