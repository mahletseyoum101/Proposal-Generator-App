export type ProposalStatus =
  | "draft"
  | "published"
  | "viewed"
  | "signed"
  | "paid";

export interface PackageCategory {
  title: string;
  items: string[];
  /** Share of price_total this category represents, 0-1. Weights across all categories sum to 1. */
  price_weight: number;
}

export interface TitledPoint {
  title: string;
  description: string;
}

export interface ProposalContent {
  /** Short, client-specific project title shown under the business name on the cover. */
  project_title: string;
  /** One-line tagline under the project title, e.g. "Prepared for a stronger online presence." */
  footer_tagline: string;
  service_tags: string[];

  /** Exactly 4 — the client's specific problem areas. */
  problem_areas: TitledPoint[];
  /** Exactly 4 — the client-specific benefits of the proposed solution. */
  solution_benefits: TitledPoint[];

  package_categories: PackageCategory[];

  closing_message: string;

  contact_email: string;
  contact_phone: string;
  contact_website: string;
}

export interface Proposal {
  id: string;
  owner_id: string;
  client_name: string;
  business_name: string;
  client_email: string | null;
  package_name: string;
  price_total: number;
  deposit_percent: number;
  revisions_rounds: number;
  delivery_timeline: string;
  brief_text: string;
  content: ProposalContent;
  status: ProposalStatus;
  public_token: string;
  created_at: string;
  published_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  paid_at: string | null;
}

export interface ProposalSignature {
  id: string;
  proposal_id: string;
  signer_name: string;
  signature_image_url: string;
  signed_at: string;
}

export interface ProposalPayment {
  id: string;
  proposal_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

/** Amount the client owes right now, in whole currency units (e.g. dollars). */
export function amountDue(proposal: Pick<Proposal, "price_total" | "deposit_percent">) {
  if (proposal.deposit_percent && proposal.deposit_percent > 0 && proposal.deposit_percent < 100) {
    return Math.round(proposal.price_total * (proposal.deposit_percent / 100) * 100) / 100;
  }
  return proposal.price_total;
}

/**
 * Per-category dollar amounts for the investment table, normalized so weights always sum to 1
 * (defensive against imprecise AI-suggested weights) and so the amounts always sum exactly to
 * price_total (any rounding remainder is absorbed into the last category).
 */
export function categoryAmounts(priceTotal: number, categories: PackageCategory[]): number[] {
  const totalWeight = categories.reduce((sum, c) => sum + (c.price_weight || 0), 0);
  if (totalWeight <= 0) {
    const even = Math.round((priceTotal / categories.length) * 100) / 100;
    return categories.map(() => even);
  }
  const amounts = categories.map((c) =>
    Math.round(priceTotal * ((c.price_weight || 0) / totalWeight) * 100) / 100
  );
  const remainder = Math.round((priceTotal - amounts.reduce((s, a) => s + a, 0)) * 100) / 100;
  amounts[amounts.length - 1] = Math.round((amounts[amounts.length - 1] + remainder) * 100) / 100;
  return amounts;
}
