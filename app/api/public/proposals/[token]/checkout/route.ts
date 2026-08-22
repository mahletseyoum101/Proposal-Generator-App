import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { amountDue, type Proposal } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("public_token", token)
    .single<Proposal>();

  if (error || !proposal || proposal.status === "draft") {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status === "published" || proposal.status === "viewed") {
    return NextResponse.json({ error: "Please sign the proposal before paying" }, { status: 403 });
  }

  if (proposal.status === "paid") {
    return NextResponse.json({ error: "This proposal has already been paid" }, { status: 409 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const amount = amountDue(proposal);
  const isDeposit = proposal.deposit_percent > 0 && proposal.deposit_percent < 100;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `${proposal.package_name} — ${proposal.business_name}`,
            description: isDeposit
              ? `${proposal.deposit_percent}% deposit for ${proposal.package_name}`
              : `Full payment for ${proposal.package_name}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/p/${token}?paid=1`,
    cancel_url: `${origin}/p/${token}`,
    metadata: {
      proposal_id: proposal.id,
      public_token: token,
    },
  });

  await supabase.from("proposal_payments").insert({
    proposal_id: proposal.id,
    stripe_session_id: session.id,
    amount,
    currency: "usd",
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
