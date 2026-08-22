import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import type { Proposal } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select(
      "id, client_name, business_name, package_name, price_total, status, created_at, public_token"
    )
    .order("created_at", { ascending: false })
    .returns<
      Pick<
        Proposal,
        | "id"
        | "client_name"
        | "business_name"
        | "package_name"
        | "price_total"
        | "status"
        | "created_at"
        | "public_token"
      >[]
    >();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-dodo-ink">Proposals</h1>
          <p className="text-dodo-muted mt-1">Every proposal you&apos;ve created, in one place.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-dodo-ink text-white rounded-full px-5 py-2.5 font-medium hover:opacity-90 transition"
        >
          + Create New Proposal
        </Link>
      </div>

      {!proposals || proposals.length === 0 ? (
        <div className="border border-dashed border-dodo-border rounded-2xl py-20 text-center">
          <p className="text-dodo-muted mb-4">You haven&apos;t created any proposals yet.</p>
          <Link href="/dashboard/new" className="text-dodo-gold-dark font-medium">
            Create your first proposal &rarr;
          </Link>
        </div>
      ) : (
        <div className="border border-dodo-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dodo-cream text-left text-dodo-muted">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-t border-dodo-border">
                  <td className="px-5 py-4">
                    <div className="font-medium text-dodo-ink">{p.client_name}</div>
                    <div className="text-dodo-muted">{p.business_name}</div>
                  </td>
                  <td className="px-5 py-4 text-dodo-body">{p.package_name}</td>
                  <td className="px-5 py-4 text-dodo-body">
                    ${p.price_total.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-dodo-muted">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right space-x-3">
                    {p.status !== "draft" && (
                      <a
                        href={`/p/${p.public_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-dodo-gold-dark font-medium"
                      >
                        View
                      </a>
                    )}
                    <Link href={`/dashboard/${p.id}/edit`} className="text-dodo-ink font-medium">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
