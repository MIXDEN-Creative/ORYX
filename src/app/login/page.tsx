import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 32, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 36, margin: 0 }}>Login</h1>
          <p style={{ opacity: 0.8, marginTop: 10 }}>Loading...</p>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
