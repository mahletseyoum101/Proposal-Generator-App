import type { ProposalStatus } from "@/lib/types";

const STYLES: Record<ProposalStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-blue-50 text-blue-700",
  viewed: "bg-amber-50 text-amber-700",
  signed: "bg-purple-50 text-purple-700",
  paid: "bg-emerald-50 text-emerald-700",
};

const LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  published: "Published",
  viewed: "Viewed",
  signed: "Signed",
  paid: "Paid",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
