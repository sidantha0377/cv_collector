import "dotenv/config";
import { getTableServiceClient, TABLE_NAMES } from "./table-client";

async function provisionTables(): Promise<void> {
  const serviceClient = getTableServiceClient();

  const tables = Object.values(TABLE_NAMES);

  console.log(
    `\n🔧  Provisioning ${tables.length} Azure Table Storage tables…\n`,
  );

  const results = await Promise.allSettled(
    tables.map(async (tableName) => {
      try {
        await serviceClient.createTable(tableName);
        console.log(`  ✅  Created  : ${tableName}`);
      } catch (err: unknown) {
        // 409 Conflict means the table already exists — that's fine.
        if (
          err instanceof Error &&
          "statusCode" in (err as unknown as Record<string, unknown>) &&
          (err as unknown as Record<string, unknown>).statusCode === 409
        ) {
          console.log(`  ⏭️   Exists   : ${tableName}`);
        } else {
          console.error(`  ❌  Failed   : ${tableName}`, err);
          throw err;
        }
      }
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");

  if (failed.length > 0) {
    console.error(`\n❌  ${failed.length} table(s) failed to provision.\n`);
    process.exit(1);
  }

  console.log("\n✅  All tables are ready.\n");
}

provisionTables().catch((err) => {
  console.error("Fatal error during table provisioning:", err);
  process.exit(1);
});
