type EventMapProps = {
  address: string;
};

export default function EventMap({ address }: EventMapProps) {
  const safeAddress = encodeURIComponent(address || "Baltimore, MD");
  const embedUrl = `https://www.google.com/maps?q=${safeAddress}&z=14&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${safeAddress}`;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[24px] border border-[#A259FF]/30 bg-zinc-950">
        <iframe
          title="Event location map"
          src={embedUrl}
          className="h-[320px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-xl border border-[#A259FF]/30 bg-[#A259FF]/10 px-4 py-2 text-sm font-medium text-[#CDA8FF] transition hover:bg-[#A259FF]/15"
      >
        Open in Google Maps
      </a>
    </div>
  );
}