import { emailQueue } from "../src/lib/queues/emailQueue.js";

await emailQueue.add("ticket-confirmation", {
  email: "test@example.com",
  eventName: "EVNTSZN Test Event",
});

console.log("Queued test job");
process.exit(0);
