"use client";

type TicketType = {
  name: string;
  price: string;
  quantity: string;
};

type TicketTypeBuilderProps = {
  isFree: boolean;
  earlyBirdEnabled: boolean;
  vipEnabled: boolean;
  vipPlusEnabled: boolean;
  customTicketingEnabled: boolean;
  setCustomTicketingEnabled: (value: boolean) => void;
  ticketTypes: TicketType[];
  setTicketTypes: (value: TicketType[]) => void;
};

function ensurePresetRows(
  existing: TicketType[],
  presetNames: string[],
  isFree: boolean
): TicketType[] {
  return presetNames.map((presetName) => {
    const found = existing.find((ticket) => ticket.name === presetName);
    if (found) return found;

    return {
      name: presetName,
      price: isFree ? "0" : "",
      quantity: "",
    };
  });
}

export default function TicketTypeBuilder({
  isFree,
  earlyBirdEnabled,
  vipEnabled,
  vipPlusEnabled,
  customTicketingEnabled,
  setCustomTicketingEnabled,
  ticketTypes,
  setTicketTypes,
}: TicketTypeBuilderProps) {
  const presetNames = [
    "General Admission",
    ...(earlyBirdEnabled ? ["Early Bird"] : []),
    ...(vipEnabled ? ["VIP"] : []),
    ...(vipPlusEnabled ? ["VIP+"] : []),
  ];

  const presetRows = ensurePresetRows(ticketTypes, presetNames, isFree);

  function updatePresetTicket(index: number, key: keyof TicketType, value: string) {
    const next = [...presetRows];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    setTicketTypes(next);
  }

  function updateCustomTicket(index: number, key: keyof TicketType, value: string) {
    const next = [...ticketTypes];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    setTicketTypes(next);
  }

  function addTicketRow() {
    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        price: isFree ? "0" : "",
        quantity: "",
      },
    ]);
  }

  function removeTicketRow(index: number) {
    const next = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(next);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[#A259FF]/75 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-white">Ticket Types</p>
          <p className="mt-1 text-sm text-zinc-500">
            Use EVNTSZN presets or create your own custom ticket tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCustomTicketingEnabled(!customTicketingEnabled)}
          className={`relative h-8 w-16 rounded-full border transition ${
            customTicketingEnabled
              ? "border-[#A259FF] bg-[#A259FF]/50 shadow-[0_0_0_1px_rgba(162,89,255,0.55),0_0_32px_rgba(162,89,255,0.45)]"
              : "border-zinc-700 bg-black/40"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_0_20px_rgba(162,89,255,0.65)] transition ${
              customTicketingEnabled ? "left-9" : "left-1"
            }`}
          />
        </button>
      </div>

      {!customTicketingEnabled ? (
        <div className="space-y-4">
          {presetRows.map((ticket, index) => (
            <div
              key={`${ticket.name}-${index}`}
              className="grid gap-4 rounded-2xl border border-[#A259FF]/65 bg-black/40 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]"
            >
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Tier Name
                </label>
                <input
                  value={ticket.name}
                  onChange={(e) => updatePresetTicket(index, "name", e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                  placeholder="Ticket name"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Price (USD)
                </label>
                <input
                  value={isFree ? "0" : ticket.price}
                  onChange={(e) => updatePresetTicket(index, "price", e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                  placeholder={isFree ? "0" : "25.00"}
                  disabled={isFree}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Quantity
                </label>
                <input
                  value={ticket.quantity}
                  onChange={(e) => updatePresetTicket(index, "quantity", e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                  placeholder="100"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((ticket, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-2xl border border-[#A259FF]/65 bg-black/40 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
            >
              <input
                value={ticket.name}
                onChange={(e) => updateCustomTicket(index, "name", e.target.value)}
                className="h-12 rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                placeholder="Custom ticket name"
              />

              <input
                value={isFree ? "0" : ticket.price}
                onChange={(e) => updateCustomTicket(index, "price", e.target.value)}
                className="h-12 rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                placeholder={isFree ? "0" : "25.00"}
                disabled={isFree}
              />

              <input
                value={ticket.quantity}
                onChange={(e) => updateCustomTicket(index, "quantity", e.target.value)}
                className="h-12 rounded-xl border border-[#A259FF]/70 bg-zinc-950 px-4 text-white outline-none focus:border-[#A259FF]"
                placeholder="100"
              />

              <button
                type="button"
                onClick={() => removeTicketRow(index)}
                className="h-12 rounded-xl border border-red-500/50 px-4 text-sm text-red-300"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addTicketRow}
            className="rounded-xl border border-[#A259FF]/75 bg-[#A259FF]/14 px-4 py-3 text-sm font-medium text-[#D7BBFF]"
          >
            Add Custom Ticket Type
          </button>
        </div>
      )}
    </div>
  );
}