import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signerName, signatureDataUrl } = await request.json();

  if (!signerName?.trim() || !signatureDataUrl) {
    return NextResponse.json({ error: "Signer name and signature are required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("public_token", token)
    .single();

  if (fetchError || !proposal || proposal.status === "draft") {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status === "signed" || proposal.status === "paid") {
    return NextResponse.json({ error: "This proposal has already been signed" }, { status: 409 });
  }

  const base64 = signatureDataUrl.split(",")[1];
  const bytes = Buffer.from(base64, "base64");
  const path = `${proposal.id}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(path, bytes, { contentType: "image/png" });

  if (uploadError) {
    console.error("Failed to upload signature:", uploadError);
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("signatures").getPublicUrl(path);

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error: insertError } = await supabase.from("proposal_signatures").insert({
    proposal_id: proposal.id,
    signer_name: signerName.trim(),
    signature_image_url: publicUrl,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("Failed to record signature:", insertError);
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }

  await supabase
    .from("proposals")
    .update({ status: "signed", signed_at: new Date().toISOString() })
    .eq("id", proposal.id);

  return NextResponse.json({ ok: true });
}
