import Image from "next/image";
import { supabaseService } from "@/lib/supabaseServer";
import RotatingTicketQR from "@/components/RotatingTicketQR";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const supabase = supabaseService();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("public_id,event_id,status")
    .eq("public_id", publicId)
    .single();

  if (error || !ticket) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 26 }}>Ticket Not Found</div>
          <div style={{ opacity: 0.85, marginTop: 10 }}>
            This ticket ID does not exist.
          </div>
        </div>
      </div>
    );
  }

  if (ticket.status !== "paid") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 26 }}>Ticket Not Active</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(900px 520px at 50% 30%, rgba(162,89,255,0.32), rgba(0,0,0,1) 70%)",
        color: "#fff",
        padding: 18,
      }}
    >
      <div style={{ width: "min(520px, 92vw)", textAlign: "center" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}>
          <Image
            src="/evntszn-logo.png"
            alt="EVNTSZN"
            width={160}
            height={160}
            priority
          />
        </div>

        <div style={{ fontWeight: 900, letterSpacing: 1, fontSize: 20, marginBottom: 14 }}>
          EVNTSZN ENTRY PASS
        </div>

        <RotatingTicketQR
          publicId={ticket.public_id}
          eventId={ticket.event_id}
        />

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
          Ticket ID: {ticket.public_id}
        </div>

        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
          Present this QR at entry
        </div>
      </div>
    </div>
  );
}
