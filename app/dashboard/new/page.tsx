"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [packageName, setPackageName] = useState("");
  const [priceTotal, setPriceTotal] = useState("");
  const [depositPercent, setDepositPercent] = useState("100");
  const [revisionsRounds, setRevisionsRounds] = useState("2");
  const [deliveryTimeline, setDeliveryTimeline] = useState("2-3 weeks");
  const [briefText, setBriefText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          businessName,
          clientEmail,
          packageName,
          priceTotal,
          depositPercent,
          revisionsRounds,
          deliveryTimeline,
          briefText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      router.push(`/dashboard/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="text-sm text-dodo-muted hover:text-dodo-ink">
        &larr; Back to proposals
      </Link>
      <h1 className="text-2xl font-semibold text-dodo-ink mt-2 mb-1">Create a new proposal</h1>
      <p className="text-dodo-muted mb-8">
        Fill in the deal details and describe the project. Opus 5 will draft the full proposal —
        you&apos;ll review and edit before it goes live.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Client name</label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Business name</label>
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="Smith & Co."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-dodo-ink mb-1">
              Client email <span className="text-dodo-muted font-normal">(optional, for your reference)</span>
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="jane@smithco.com"
            />
          </div>
        </fieldset>

        <fieldset className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-dodo-ink mb-1">Package name</label>
            <input
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="Growth Package"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Total price ($)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={priceTotal}
              onChange={(e) => setPriceTotal(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="3500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">
              Deposit % <span className="text-dodo-muted font-normal">(100 = full payment)</span>
            </label>
            <input
              required
              type="number"
              min="1"
              max="100"
              value={depositPercent}
              onChange={(e) => setDepositPercent(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Revision rounds</label>
            <input
              required
              type="number"
              min="0"
              value={revisionsRounds}
              onChange={(e) => setRevisionsRounds(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Delivery timeline</label>
            <input
              required
              value={deliveryTimeline}
              onChange={(e) => setDeliveryTimeline(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              placeholder="2-3 weeks"
            />
          </div>
        </fieldset>

        <fieldset>
          <label className="block text-sm font-medium text-dodo-ink mb-1">
            Project brief <span className="text-dodo-muted font-normal">(1-2 paragraphs)</span>
          </label>
          <p className="text-sm text-dodo-muted mb-2">
            Describe the client, their situation, and what you&apos;ll be doing for them. Opus 5
            uses this to write the whole proposal.
          </p>
          <textarea
            required
            rows={6}
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            className="w-full border border-dodo-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            placeholder="Jane runs a boutique bakery in Austin with a loyal in-person following but almost no online presence. She needs a simple website, consistent social content, and an easier way to manage online orders..."
          />
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-dodo-ink text-white rounded-full px-6 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Drafting with Opus 5…" : "Generate proposal"}
        </button>
      </form>
    </div>
  );
}
