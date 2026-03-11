import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("tickets")
    .select("public_id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.public_id) return NextResponse.json({ error: "Ticket not minted yet" }, { status: 200 });

  return NextResponse.json({ publicId: data.public_id });
}
