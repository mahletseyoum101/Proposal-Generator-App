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
            <Field label="Project title" value={c.project_title} onChange={(v) => updateContent("project_title", v)} />
            <Field label="Footer tagline" value={c.footer_tagline} onChange={(v) => updateContent("footer_tagline", v)} />
            <StringList label="Service tags" items={c.service_tags} onChange={(v) => updateContent("service_tags", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Your Problem Areas</h2>
            <TitledList label="Problem areas (4)" items={c.problem_areas} onChange={(v) => updateContent("problem_areas", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Your Solution</h2>
            <TitledList label="Solution benefits (4)" items={c.solution_benefits} onChange={(v) => updateContent("solution_benefits", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Package</h2>
            <CategoryList label="Included categories" categories={c.package_categories} onChange={(v) => updateContent("package_categories", v)} />
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-dodo-ink">Closing</h2>
            <TextAreaField label="Thank-you message" value={c.closing_message} onChange={(v) => updateContent("closing_message", v)} />
            <Field label="Contact email" value={c.contact_email} onChange={(v) => updateContent("contact_email", v)} />
            <Field label="Contact phone / WhatsApp" value={c.contact_phone} onChange={(v) => updateContent("contact_phone", v)} />
            <Field label="Website / portfolio" value={c.contact_website} onChange={(v) => updateContent("contact_website", v)} />
          </section>

          <section className="space-y-2 border-t border-dodo-border pt-6">
            <h2 className="font-semibold text-dodo-ink">Standing company content</h2>
            <p className="text-sm text-dodo-muted leading-relaxed">
              &ldquo;What We Do&rdquo;, &ldquo;Why Us&rdquo;, &ldquo;Why That Matters&rdquo;, the
              process steps, the promise, and the agreement summary are fixed Dodo Digital copy
              shared by every proposal — edit them in{" "}
              <code className="text-xs bg-dodo-cream px-1.5 py-0.5 rounded">lib/agency-content.ts</code>{" "}
              to change them everywhere at once.
            </p>
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
