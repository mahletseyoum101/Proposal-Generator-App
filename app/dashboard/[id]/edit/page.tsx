import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProposalEditor } from "@/components/editor/ProposalEditor";
import type { Proposal } from "@/lib/types";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single<Proposal>();

  if (!proposal) notFound();

  return (
    <div className="max-w-6xl">
      <ProposalEditor proposal={proposal} />
    </div>
  );
}
