"use client";

import { useState } from "react";

type BuyTicketButtonProps = {
  slug: string;
};

export default function BuyTicketButton({ slug }: BuyTicketButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (!data.ok || !data.url) {
        alert(data.error || "Failed to start checkout.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Failed to start checkout.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-xl bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
    >
      {loading ? "Redirecting..." : "Buy Ticket"}
    </button>
  );
}