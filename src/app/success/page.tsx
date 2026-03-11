import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Payment received ✅</h1>
        <p>Missing session_id.</p>
      </main>
    );
  }

  // OPTIONAL: if you already have an API that exchanges session_id -> publicId, call it here
  // For now, if your publicId is literally "st_<session_id>" then redirect:
  redirect(`/ticket/st_${session_id}`);
  
  // If you prefer to show a button instead of redirect, remove redirect() and use Link below.
  // return (
  //   <main style={{ padding: 24 }}>
  //     <h1>Payment received ✅</h1>
  //     <p>Opening your ticket...</p>
  //     <Link href={`/ticket/st_${session_id}`}>View Ticket</Link>
  //   </main>
  // );
}
