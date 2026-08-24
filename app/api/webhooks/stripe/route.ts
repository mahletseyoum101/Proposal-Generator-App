import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // "checkout.session.completed" fires once checkout finishes, but for delayed payment
  // methods (e.g. bank debits) the payment itself can still be pending at that point —
  // Stripe confirms actual settlement via "async_payment_succeeded" instead. Only mark a
  // proposal paid once we know the money actually cleared.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const proposalId = session.metadata?.proposal_id;

    if (proposalId && session.payment_status === "paid") {
      const supabase = createAdminClient();

      await supabase
        .from("proposal_payments")
        .update({
          status: "paid",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("stripe_session_id", session.id);

      await supabase
        .from("proposals")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", proposalId);
    }
  }

  return NextResponse.json({ received: true });
}
