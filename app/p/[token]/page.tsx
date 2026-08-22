import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProposalTemplate } from "@/components/ProposalTemplate";
import { PublicProposalActions } from "./PublicProposalActions";
import type { Proposal } from "@/lib/types";

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("public_token", token)
    .single<Proposal>();

  if (!proposal || proposal.status === "draft") {
    notFound();
  }

  if (proposal.status === "published") {
    await supabase
      .from("proposals")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", proposal.id)
      .eq("status", "published");
    proposal.status = "viewed";
  }

  const { data: signature } = await supabase
    .from("proposal_signatures")
    .select("signer_name, signed_at")
    .eq("proposal_id", proposal.id)
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <ProposalTemplate proposal={proposal} />
      <PublicProposalActions
        token={token}
        initialStatus={proposal.status}
        priceTotal={proposal.price_total}
        depositPercent={proposal.deposit_percent}
        existingSignerName={signature?.signer_name ?? null}
      />
    </div>
  );
}
