import { emailQueue } from "../src/lib/queues/emailQueue";

async function main() {
  await emailQueue.add("ticket-confirmation", {
    email: "test@example.com",
    eventName: "EVNTSZN Test Event",
  });

  console.log("Queued test job");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test job failed:", err);
  process.exit(1);
});
