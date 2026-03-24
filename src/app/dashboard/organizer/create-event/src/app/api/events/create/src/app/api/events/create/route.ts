import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TicketTypeInput = {
  name: string;
  price: string;
  quantity: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "").trim();
    const city = String(body.city ?? "").trim();
    const venueName = String(body.venueName ?? "").trim();
    const venueAddress = String(body.venueAddress ?? "").trim();
    const venueWebsite = String(body.venueWebsite ?? "").trim();
    const eventDate = String(body.eventDate ?? "").trim();
    const startTime = String(body.startTime ?? "").trim();
    const ticketQuantity = Number(body.ticketQuantity ?? 0);
    const ageRequirement = String(body.ageRequirement ?? "").trim();
    const customAgeRequirement = String(body.customAgeRequirement ?? "").trim();
    const attire = String(body.attire ?? "").trim();
    const refundsAllowed = Boolean(body.refundsAllowed);
    const isFree = Boolean(body.isFree);
    const earlyBirdEnabled = Boolean(body.earlyBirdEnabled);
    const vipEnabled = Boolean(body.vipEnabled);
    const vipPlusEnabled = Boolean(body.vipPlusEnabled);
    const customTicketingEnabled = Boolean(body.customTicketingEnabled);
    const adaInfo = String(body.adaInfo ?? "").trim();
    const parkingInfo = String(body.parkingInfo ?? "").trim();

    const repPayoutEnabled = Boolean(body.repPayoutEnabled);
    const repPayoutType = String(body.repPayoutType ?? "").trim();
    const repPayoutValue =
      body.repPayoutValue === "" || body.repPayoutValue === null || body.repPayoutValue === undefined
        ? null
        : Number(body.repPayoutValue);
    const repInviteEmail = String(body.repInviteEmail ?? "").trim().toLowerCase();
    const repInviteRole = String(body.repInviteRole ?? "promoter").trim();

    const faq1Question = String(body.faq1Question ?? "").trim();
    const faq1Answer = String(body.faq1Answer ?? "").trim();
    const faq2Question = String(body.faq2Question ?? "").trim();
    const faq2Answer = String(body.faq2Answer ?? "").trim();
    const faq3Question = String(body.faq3Question ?? "").trim();
    const faq3Answer = String(body.faq3Answer ?? "").trim();

    const imageUrl1 = String(body.imageUrl1 ?? "").trim();
    const imageUrl2 = String(body.imageUrl2 ?? "").trim();
    const imageUrl3 = String(body.imageUrl3 ?? "").trim();
    const contentPermissionAccepted = Boolean(body.contentPermissionAccepted);
    const organizationSlug = String(body.organizationSlug ?? "").trim();

    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
      : [];

    const ticketTypes = Array.isArray(body.ticketTypes)
      ? (body.ticketTypes as TicketTypeInput[])
      : [];

    if (
      !title ||
      !category ||
      !description ||
      !venueName ||
      !venueAddress ||
      !eventDate ||
      !startTime ||
      !city ||
      !ageRequirement ||
      !customAgeRequirement ||
      !attire ||
      !organizationSlug
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!contentPermissionAccepted) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "You must accept the EVNTSZN content usage permission for platform, social media, and marketing use.",
        },
        { status: 400 }
      );
    }

    if (!imageUrl1 || !imageUrl2) {
      return NextResponse.json(
        { ok: false, error: "At least 2 event images are required." },
        { status: 400 }
      );
    }

    if (!ticketQuantity || ticketQuantity < 1) {
      return NextResponse.json(
        { ok: false, error: "Ticket quantity must be at least 1." },
        { status: 400 }
      );
    }

    const cleanedTicketTypes = ticketTypes
      .filter((ticket) => ticket.name.trim() !== "")
      .map((ticket, index) => ({
        name: ticket.name.trim(),
        price_cents: isFree ? 0 : Math.max(0, Math.round(Number(ticket.price || 0) * 100)),
        quantity: ticket.quantity ? Number(ticket.quantity) : null,
        sort_order: index,
      }));

    if (!isFree && cleanedTicketTypes.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Add at least one paid ticket tier." },
        { status: 400 }
      );
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, slug")
      .eq("slug", organizationSlug)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { ok: false, error: "Organization not found." },
        { status: 404 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Invalid event date." },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const basePriceCents =
      cleanedTicketTypes.length > 0
        ? Math.min(...cleanedTicketTypes.map((ticket) => ticket.price_cents))
        : 0;

    const { data: event, error: insertError } = await supabaseAdmin
      .from("events")
      .insert({
        organization_id: organization.id,
        title,
        description,
        category,
        city,
        venue_name: venueName,
        venue_address: venueAddress,
        venue_website: venueWebsite || null,
        location: city,
        event_date: parsedDate.toISOString(),
        start_time: startTime,
        ticket_price: isFree ? 0 : Math.round(basePriceCents / 100),
        ticket_quantity: Math.round(ticketQuantity),
        price_cents: isFree ? 0 : basePriceCents,
        capacity: Math.round(ticketQuantity),
        age_requirement: ageRequirement,
        custom_age_requirement: customAgeRequirement,
        attire,
        refunds_allowed: refundsAllowed,
        ada_info: adaInfo || null,
        parking_info: parkingInfo || null,
        image_url_1: imageUrl1 || null,
        image_url_2: imageUrl2 || null,
        image_url_3: imageUrl3 || null,
        image_path_1: imageUrl1 || null,
        image_path_2: imageUrl2 || null,
        image_path_3: imageUrl3 || null,
        cover_image_url: imageUrl1 || null,
        content_permission_accepted: contentPermissionAccepted,
        is_free: isFree,
        early_bird_enabled: earlyBirdEnabled,
        vip_enabled: vipEnabled,
        vip_plus_enabled: vipPlusEnabled,
        custom_ticketing_enabled: customTicketingEnabled,
        faq_1_question: faq1Question || null,
        faq_1_answer: faq1Answer || null,
        faq_2_question: faq2Question || null,
        faq_2_answer: faq2Answer || null,
        faq_3_question: faq3Question || null,
        faq_3_answer: faq3Answer || null,
        rep_payout_enabled: repPayoutEnabled,
        rep_payout_type: repPayoutEnabled ? repPayoutType || null : null,
        rep_payout_value: repPayoutEnabled ? repPayoutValue : null,
        tags,
        slug: uniqueSlug,
        status: "published",
      })
      .select("id, slug")
      .single();

    if (insertError || !event) {
      return NextResponse.json(
        { ok: false, error: insertError?.message ?? "Failed to create event." },
        { status: 500 }
      );
    }

    if (cleanedTicketTypes.length > 0) {
      const rows = cleanedTicketTypes.map((ticket) => ({
        event_id: event.id,
        name: ticket.name,
        price_cents: ticket.price_cents,
        quantity: ticket.quantity,
        sort_order: ticket.sort_order,
        is_active: true,
      }));

      await supabaseAdmin.from("event_ticket_types").insert(rows);
    }

    if (repPayoutEnabled && repInviteEmail) {
      await supabaseAdmin.from("event_rep_invites").insert({
        event_id: event.id,
        organizer_organization_id: organization.id,
        email: repInviteEmail,
        role: repInviteRole,
        payout_type: repPayoutType || null,
        payout_value: repPayoutValue,
      });
    }

    return NextResponse.json({
      ok: true,
      eventId: event.id,
      slug: event.slug,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error creating event." },
      { status: 500 }
    );
  }
}