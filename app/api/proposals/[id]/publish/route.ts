import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("proposals")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("public_token")
    .single();

  if (error || !data) {
    console.error("Failed to publish proposal:", error);
    return NextResponse.json({ error: "Failed to publish proposal" }, { status: 500 });
  }

  return NextResponse.json({ publicToken: data.public_token });
}
