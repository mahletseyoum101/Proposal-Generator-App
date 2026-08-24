import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProposalContent } from "@/lib/ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const {
    clientName,
    businessName,
    clientEmail,
    packageName,
    priceTotal,
    depositPercent,
    revisionsRounds,
    deliveryTimeline,
    briefText,
  } = body;

  if (!clientName || !businessName || !packageName || !priceTotal || !briefText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let content;
  try {
    content = await generateProposalContent({
      clientName,
      businessName,
      packageName,
      priceTotal: Number(priceTotal),
      depositPercent: Number(depositPercent) || 100,
      revisionsRounds: Number(revisionsRounds) || 2,
      deliveryTimeline: deliveryTimeline || "2-3 weeks",
      briefText,
    });
  } catch (err) {
    console.error("AI generation failed:", err);
    return NextResponse.json({ error: "Failed to generate proposal content" }, { status: 502 });
  }

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      owner_id: user.id,
      client_name: clientName,
      business_name: businessName,
      client_email: clientEmail || null,
      package_name: packageName,
      price_total: Number(priceTotal),
      deposit_percent: Number(depositPercent) || 100,
      revisions_rounds: Number(revisionsRounds) || 2,
      delivery_timeline: deliveryTimeline || "2-3 weeks",
      brief_text: briefText,
      content,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !proposal) {
    console.error("Failed to save proposal:", error);
    return NextResponse.json({ error: "Failed to save proposal" }, { status: 500 });
  }

  return NextResponse.json({ id: proposal.id });
}
