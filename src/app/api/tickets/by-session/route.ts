import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const supabase = supabaseService();
  const { data, error } = await supabase
    .from("tickets")
    .select("public_id, event_id, buyer_email, buyer_name, status, checked_in_at, created_at")
    .eq("stripe_checkout_session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tickets: data || [] });
}
