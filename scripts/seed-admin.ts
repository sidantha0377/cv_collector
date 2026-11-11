import { TableClient } from "@azure/data-tables";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seedAdmin() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      "❌ AZURE_STORAGE_CONNECTION_STRING is not set in .env.local",
    );
    process.exit(1);
  }

  const email = process.argv[2]; //add email here

  if (!email) {
    console.error("❌ Please provide an email address.");
    console.error("   Usage: npx tsx scripts/seed-admin.ts your@email.com");
    process.exit(1);
  }

  const client = TableClient.fromConnectionString(connectionString, "admins");

  // Create table if it doesn't exist
  try {
    await client.createTable();
    console.log("✅ admins table created.");
  } catch {
    // Table already exists, that's fine
  }

  try {
    await client.createEntity({
      partitionKey: "admin",
      rowKey: email,
      email: email,
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Admin seeded successfully: ${email}`);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      (err as { statusCode: number }).statusCode === 409
    ) {
      console.log(`ℹ️  Admin already exists: ${email}`);
    } else {
      console.error("❌ Failed to seed admin:", err);
      process.exit(1);
    }
  }
}

seedAdmin();
