"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SignaturePad } from "@/components/SignaturePad";
import { CelebrationAnimation } from "@/components/CelebrationAnimation";
import { amountDue, type ProposalStatus } from "@/lib/types";

interface Props {
  token: string;
  initialStatus: ProposalStatus;
  priceTotal: number;
  depositPercent: number;
  existingSignerName: string | null;
}

function ActionsInner({ token, initialStatus, priceTotal, depositPercent, existingSignerName }: Props) {
  const searchParams = useSearchParams();
  const arrivingFromCheckout = searchParams.get("paid") === "1";

  const [status, setStatus] = useState<ProposalStatus>(initialStatus);
  const [signerName, setSignerName] = useState(existingSignerName ?? "");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(arrivingFromCheckout);
  const [error, setError] = useState<string | null>(null);

  const isSigned = status === "signed" || status === "paid" || Boolean(existingSignerName);
  const isPaid = status === "paid";
  const due = amountDue({ price_total: priceTotal, deposit_percent: depositPercent });
  const hasDeposit = depositPercent > 0 && depositPercent < 100;

  useEffect(() => {
    if (!confirmingPayment || isPaid) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const res = await fetch(`/api/public/proposals/${token}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "paid") {
          setStatus("paid");
          setConfirmingPayment(false);
          clearInterval(interval);
        }
      }
      if (attempts >= 12) {
        clearInterval(interval);
        setConfirmingPayment(false);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [confirmingPayment, isPaid, token]);

  async function handleSign() {
    if (!signerName.trim() || !signatureData) {
      setError("Add your name and signature before submitting.");
      return;
    }
    setSigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/proposals/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName, signatureDataUrl: signatureData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign");
      setStatus("signed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign");
    } finally {
      setSigning(false);
    }
  }

  async function handlePay() {
    setCheckingOut(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/proposals/${token}/checkout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setCheckingOut(false);
    }
  }

  if (isPaid) {
    return (
      <section className="px-6 sm:px-12 py-20 bg-dodo-cream text-center">
        {arrivingFromCheckout && <CelebrationAnimation />}
        <div className="max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-dodo-gold text-white flex items-center justify-center text-3xl mx-auto mb-6">
            &#10003;
          </div>
          <h2 className="text-2xl font-semibold text-dodo-ink mb-2">You&apos;re all set!</h2>
          <p className="text-dodo-muted leading-relaxed">
            Your proposal is signed and payment is confirmed. We&apos;ll be in touch shortly with
            next steps &mdash; thank you for choosing Dodo Digital.
          </p>
        </div>
      </section>
    );
  }

  if (confirmingPayment) {
    return (
      <section className="px-6 sm:px-12 py-20 bg-dodo-cream text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-10 h-10 border-2 border-dodo-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-dodo-ink mb-2">Confirming your payment&hellip;</h2>
          <p className="text-dodo-muted">This usually only takes a few seconds.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 sm:px-12 py-16 bg-dodo-cream">
      <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-8">
        <div className="bg-white border border-dodo-border rounded-2xl p-6">
          <h3 className="font-semibold text-dodo-ink mb-1">1. Sign</h3>
          {isSigned ? (
            <div className="mt-3">
              <p className="text-dodo-body">
                Signed by <span className="font-medium text-dodo-ink">{signerName}</span>
              </p>
              <p className="text-dodo-gold-dark text-sm mt-1">&#10003; Signature received</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-dodo-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              />
              <SignaturePad onChange={setSignatureData} />
              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full bg-dodo-ink text-white rounded-full py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {signing ? "Submitting…" : "Sign proposal"}
              </button>
            </div>
          )}
        </div>

        <div className={`bg-white border border-dodo-border rounded-2xl p-6 ${!isSigned ? "opacity-50" : ""}`}>
          <h3 className="font-semibold text-dodo-ink mb-1">2. Pay</h3>
          {!isSigned ? (
            <p className="text-dodo-muted text-sm mt-3">Sign the proposal to unlock payment.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-dodo-body">
                {hasDeposit ? `${depositPercent}% deposit due now` : "Full payment due now"}
              </p>
              <p className="text-2xl font-semibold text-dodo-ink">${due.toLocaleString()}</p>
              <button
                onClick={handlePay}
                disabled={checkingOut}
                className="w-full bg-dodo-gold text-white rounded-full py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {checkingOut ? "Redirecting to Stripe…" : "Pay now"}
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
    </section>
  );
}

export function PublicProposalActions(props: Props) {
  return (
    <Suspense fallback={null}>
      <ActionsInner {...props} />
    </Suspense>
  );
}
