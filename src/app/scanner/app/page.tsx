import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readScannerSession } from "@/lib/scannerSession";
import ScannerDoorApp from "@/components/ScannerDoorApp";

export default async function ScannerAppPage() {
  const jar = await cookies();
  const token = jar.get("evntszn_scanner_session")?.value || null;
  const session = readScannerSession(token);

  if (!session) {
    redirect("/scanner/login");
  }

  return <ScannerDoorApp />;
}
