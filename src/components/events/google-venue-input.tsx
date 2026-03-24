"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

type GoogleVenueInputProps = {
  value: string;
  onVenueNameChange: (value: string) => void;
  onVenueAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
};

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-evntszn-google-maps="true"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.evntsznGoogleMaps = "true";

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load."));

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export default function GoogleVenueInput({
  value,
  onVenueNameChange,
  onVenueAddressChange,
  onCityChange,
}: GoogleVenueInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [placeholder, setPlaceholder] = useState("Loading Google venue search...");

  useEffect(() => {
    let mounted = true;

    async function initAutocomplete() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey || !inputRef.current) {
          if (mounted) setPlaceholder("Google Maps key missing.");
          return;
        }

        await loadGoogleMaps(apiKey);

        if (!mounted || !inputRef.current || !window.google?.maps?.places) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["name", "formatted_address", "address_components"],
          types: ["establishment"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place) return;

          const venueName = place.name || "";
          const venueAddress = place.formatted_address || "";

          let city = "";
          const components = place.address_components || [];

          for (const component of components) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (!city && component.types.includes("postal_town")) {
              city = component.long_name;
            }
            if (!city && component.types.includes("administrative_area_level_2")) {
              city = component.long_name;
            }
          }

          onVenueNameChange(venueName);
          onVenueAddressChange(venueAddress);
          onCityChange(city);
        });

        if (mounted) {
          setPlaceholder("Search real venue with Google");
        }
      } catch {
        if (mounted) {
          setPlaceholder("Google venue search failed to load.");
        }
      }
    }

    initAutocomplete();

    return () => {
      mounted = false;
    };
  }, [onVenueNameChange, onVenueAddressChange, onCityChange]);

  return (
    <div className="rounded-2xl border border-[#A259FF]/70 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
      <label className="text-sm font-medium text-white">Venue Search</label>
      <p className="mt-1 text-sm text-zinc-500">
        Search a real venue and let Google autofill the venue name, address, and city.
      </p>

      <input
        ref={inputRef}
        defaultValue={value}
        className="mt-4 h-14 w-full rounded-xl border border-[#A259FF]/70 bg-black/40 px-4 text-white outline-none transition focus:border-[#A259FF] focus:ring-1 focus:ring-[#A259FF]/60"
        placeholder={placeholder}
      />
    </div>
  );
}
