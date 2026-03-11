import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";

export async function GET(_: Request, { params }: { params: { eventId: string } }) {
  const supabase = supabaseService();
  const eventId = params.eventId;

  const { data: ev } = await supabase
    .from("events")
    .select("name,capacity")
    .eq("id", eventId)
    .single();

  const { data: stats } = await supabase
    .from("event_stats")
    .select("checked_in")
    .eq("event_id", eventId)
    .single();

  return NextResponse.json({
    title: ev?.name || "Event",
    capacity: ev?.capacity || 0,
    checkedIn: stats?.checked_in || 0,
  });
}
