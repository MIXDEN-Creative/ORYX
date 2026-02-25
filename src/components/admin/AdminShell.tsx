"use client";

import type { ReactNode } from "react";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "black",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      ADMIN SHELL LOADED
      {children}
    </div>
  );
}
