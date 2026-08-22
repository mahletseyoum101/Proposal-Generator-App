export type ProposalStatus =
  | "draft"
  | "published"
  | "viewed"
  | "signed"
  | "paid";

export interface PackageCategory {
  title: string;
  items: string[];
}

export interface TitledPoint {
  title: string;
  description: string;
}

export interface ProposalContent {
  headline: string;
  subheadline: string;
  service_tags: string[];

  opportunity_intro: string;
  pain_points: string[];
  solution_paragraph: string;

  goals: TitledPoint[];
  services: TitledPoint[];

  package_categories: PackageCategory[];

  why_package_paragraph: string;
  why_package_flow: string[];

  savings_points: string[];
  savings_benefits: string[];

  process_steps: TitledPoint[];

  expectation_questions: string[];
  promise_paragraph: string;

  closing_message: string;
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
