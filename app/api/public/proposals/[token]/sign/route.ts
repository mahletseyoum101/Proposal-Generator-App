import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signerName, signatureDataUrl } = await request.json();

  if (!signerName?.trim() || !signatureDataUrl) {
    return NextResponse.json({ error: "Signer name and signature are required" }, { status: 400 });
  }

  const dataUrlMatch = /^data:image\/png;base64,(.+)$/.exec(signatureDataUrl);
  if (!dataUrlMatch) {
    return NextResponse.json({ error: "Invalid signature image" }, { status: 400 });
  }
  const base64 = dataUrlMatch[1];
  // Reject anything absurdly large before decoding — a normal signature PNG is a few KB.
  if (base64.length > 2_000_000) {
    return NextResponse.json({ error: "Signature image is too large" }, { status: 413 });
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

  const bytes = Buffer.from(base64, "base64");
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return NextResponse.json({ error: "Invalid signature image" }, { status: 400 });
  }
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
