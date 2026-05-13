import "dotenv/config";
import { getTableClient, TABLE_NAMES } from "../lib/azure/table-client";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

const tags = [
  { tag: "javascript", count: 0 },
  { tag: "typescript", count: 0 },
  { tag: "python", count: 0 },
  { tag: "java", count: 0 },
  { tag: "csharp", count: 0 },
  { tag: "golang", count: 0 },
  { tag: "rust", count: 0 },
  { tag: "php", count: 0 },
  { tag: "kotlin", count: 0 },
  { tag: "swift", count: 0 },

  { tag: "react", count: 0 },
  { tag: "nextjs", count: 0 },
  { tag: "vuejs", count: 0 },
  { tag: "nuxtjs", count: 0 },
  { tag: "angular", count: 0 },
  { tag: "svelte", count: 0 },
  { tag: "tailwindcss", count: 0 },
  { tag: "redux", count: 0 },
  { tag: "zustand", count: 0 },
  { tag: "graphql", count: 0 },

  { tag: "nodejs", count: 0 },
  { tag: "expressjs", count: 0 },
  { tag: "nestjs", count: 0 },
  { tag: "fastify", count: 0 },
  { tag: "django", count: 0 },
  { tag: "flask", count: 0 },
  { tag: "springboot", count: 0 },
  { tag: "dotnet", count: 0 },
  { tag: "laravel", count: 0 },
  { tag: "rails", count: 0 },

  { tag: "postgresql", count: 0 },
  { tag: "mysql", count: 0 },
  { tag: "mssql", count: 0 },
  { tag: "mongodb", count: 0 },
  { tag: "redis", count: 0 },
  { tag: "elasticsearch", count: 0 },
  { tag: "firebase", count: 0 },
  { tag: "dynamodb", count: 0 },
  { tag: "sqlite", count: 0 },
  { tag: "cassandra", count: 0 },

  { tag: "aws", count: 0 },
  { tag: "azure", count: 0 },
  { tag: "gcp", count: 0 },
  { tag: "docker", count: 0 },
  { tag: "kubernetes", count: 0 },
  { tag: "terraform", count: 0 },
  { tag: "ansible", count: 0 },
  { tag: "jenkins", count: 0 },
  { tag: "githubactions", count: 0 },
  { tag: "gitlabci", count: 0 },

  { tag: "linux", count: 0 },
  { tag: "bash", count: 0 },
  { tag: "powershell", count: 0 },
  { tag: "nginx", count: 0 },
  { tag: "apache", count: 0 },
  { tag: "serverless", count: 0 },
  { tag: "microservices", count: 0 },
  { tag: "restapi", count: 0 },
  { tag: "grpc", count: 0 },
  { tag: "websockets", count: 0 },

  { tag: "ai", count: 0 },
  { tag: "machinelearning", count: 0 },
  { tag: "deeplearning", count: 0 },
  { tag: "nlp", count: 0 },
  { tag: "computervision", count: 0 },
  { tag: "pytorch", count: 0 },
  { tag: "tensorflow", count: 0 },
  { tag: "scikitlearn", count: 0 },
  { tag: "mlops", count: 0 },
  { tag: "databricks", count: 0 },

  { tag: "dataengineering", count: 0 },
  { tag: "bigdata", count: 0 },
  { tag: "spark", count: 0 },
  { tag: "hadoop", count: 0 },
  { tag: "kafka", count: 0 },
  { tag: "airflow", count: 0 },
  { tag: "etl", count: 0 },
  { tag: "powerbi", count: 0 },
  { tag: "tableau", count: 0 },
  { tag: "snowflake", count: 0 },

  { tag: "cybersecurity", count: 0 },
  { tag: "penetrationtesting", count: 0 },
  { tag: "siem", count: 0 },
  { tag: "devsecops", count: 0 },
  { tag: "iam", count: 0 },
  { tag: "oauth", count: 0 },
  { tag: "saml", count: 0 },
  { tag: "encryption", count: 0 },
  { tag: "zerotrust", count: 0 },
  { tag: "compliance", count: 0 },

  { tag: "testing", count: 0 },
  { tag: "jest", count: 0 },
  { tag: "vitest", count: 0 },
  { tag: "playwright", count: 0 },
  { tag: "cypress", count: 0 },
  { tag: "selenium", count: 0 },
  { tag: "agile", count: 0 },
  { tag: "scrum", count: 0 },
  { tag: "jira", count: 0 },
  { tag: "productmanagement", count: 0 },
];

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

async function seedTags() {
  const client = getTableClient(TABLE_NAMES.TAGS);

  console.log(
    `\n🌱  Seeding ${tags.length} tags into Azure Table Storage...\n`,
  );

  const results = await Promise.allSettled(
    tags.map(async (item) => {
      const normalized = normalizeTag(item.tag);

      const entity = {
        partitionKey: DEFAULT_TENANT_ID,
        rowKey: normalized,
        tag: normalized,
        count: item.count,
      };

      // Safe for re-runs
      await client.upsertEntity(entity, "Merge");
      console.log(`  ✅  ${normalized}`);
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`\n❌  ${failed.length} tag(s) failed to insert.\n`);
    process.exit(1);
  }

  console.log(`\n✅  All ${tags.length} tags seeded successfully.\n`);
}

seedTags().catch((err) => {
  console.error("Fatal error during tag seeding:", err);
  process.exit(1);
});
