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

let googleMapsScriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
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
    script.dataset.googleMaps = "true";

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load."));

    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
}

export default function GoogleVenueInput({
  value,
  onVenueNameChange,
  onVenueAddressChange,
  onCityChange,
}: GoogleVenueInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [statusText, setStatusText] = useState("Loading Google venue search...");

  useEffect(() => {
    let isMounted = true;
    let autocomplete: google.maps.places.Autocomplete | null = null;

    async function setupAutocomplete() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey || !inputRef.current) {
          if (isMounted) {
            setStatusText("Google Maps key missing.");
          }
          return;
        }

        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !inputRef.current || !window.google?.maps?.places) {
          return;
        }

        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["name", "formatted_address", "address_components"],
          types: ["establishment"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
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

        if (isMounted) {
          setStatusText("Search real venue with Google");
        }
      } catch {
        if (isMounted) {
          setStatusText("Google venue search failed to load.");
        }
      }
    }

    setupAutocomplete();

    return () => {
      isMounted = false;
    };
  }, [onVenueAddressChange, onVenueNameChange, onCityChange]);

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
        placeholder={statusText}
      />
    </div>
  );
}