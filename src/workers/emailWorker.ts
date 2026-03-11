import { Worker } from "bullmq";
import { redis } from "../lib/queues/redis";

const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("Processing email job:", job.name, job.data);
    return { ok: true };
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job?.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id}`, err);
});

console.log("Email worker is running...");
