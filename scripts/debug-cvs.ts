// scripts/debug-cvs.ts

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { getTableClient, TABLE_NAMES } from "../lib/azure/table-client";

async function debugCvs() {
  const client = getTableClient(TABLE_NAMES.CVS);

  console.log("\n=== ALL CVs IN TABLE ===\n");

  const all = client.listEntities();
  let count = 0;

  for await (const entity of all) {
    count++;
    console.log({
      partitionKey: entity.partitionKey,
      rowKey: entity.rowKey,
      fileName: entity.fileName,
      uploadedAt: entity.uploadedAt,
    });
  }

  console.log(`\nTotal: ${count} CVs in table\n`);
}

debugCvs().catch(console.error);
