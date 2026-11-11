import { getEmailClient, getSenderAddress } from "@/lib/azure/email-client";

type Recipient = {
  id: string;
  email: string;
  name?: string;
};

type BulkSendResult = {
  total: number;
  sent: number;
  failed: number;
  failures: Array<{ recipientId: string; email: string; error: string }>;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
// Wraps pollUntilDone with a timeout so a stuck Azure poll
// never freezes the entire bulk batch
async function pollWithTimeout(
  poller: Awaited<ReturnType<ReturnType<typeof getEmailClient>["beginSend"]>>,
  timeoutMs = 8_000,
): Promise<{ status?: string; id?: string }> {
  return Promise.race([
    poller.pollUntilDone() as Promise<{ status?: string; id?: string }>,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Email poll timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}
//******** */
export async function sendBulkEmails(params: {
  recipients: Recipient[];
  subject: string;
  html: string;
  text?: string;
  batchSize?: number; // e.g. 50
  delayMsBetweenBatches?: number; // e.g. 500-1500
}): Promise<BulkSendResult> {
  const client = getEmailClient();
  const sender = getSenderAddress();

  const batchSize = params.batchSize ?? 10;
  const delayMs = params.delayMsBetweenBatches ?? 2000;

  let sent = 0;
  let failed = 0;
  const failures: BulkSendResult["failures"] = [];

  const batches = chunk(params.recipients, batchSize);

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (r) => {
        try {
          const poller = await client.beginSend({
            senderAddress: sender,
            content: {
              subject: params.subject,
              plainText: params.text,
              html: params.html,
            },
            recipients: {
              to: [{ address: r.email, displayName: r.name }],
            },
          });

          const result = await poller.pollUntilDone();

          // ACS returns status in result.status
          if (result.status?.toLowerCase() === "succeeded") {
            sent += 1;
          } else {
            failed += 1;
            failures.push({
              recipientId: r.id,
              email: r.email,
              error: `Send not succeeded (status: ${result.status})`,
            });
          }
        } catch (e) {
          failed += 1;
          failures.push({
            recipientId: r.id,
            email: r.email,
            error: e instanceof Error ? e.message : "Unknown send error",
          });
        }
      }),
    );

    await sleep(delayMs); // throttle
  }

  return {
    total: params.recipients.length,
    sent,
    failed,
    failures,
  };
}
