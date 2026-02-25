"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOryx } from "@/contexts/OryxContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useOryx();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      const next = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, session, router, pathname]);

  if (loading) return null;
  if (!session) return null;

  return <>{children}</>;
}
