import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    content,
  } = body;

  const { error } = await supabase
    .from("proposals")
    .update({
      client_name: clientName,
      business_name: businessName,
      client_email: clientEmail || null,
      package_name: packageName,
      price_total: Number(priceTotal),
      deposit_percent: Number(depositPercent),
      revisions_rounds: Number(revisionsRounds),
      delivery_timeline: deliveryTimeline,
      content,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Failed to update proposal:", error);
    return NextResponse.json({ error: "Failed to save changes" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
