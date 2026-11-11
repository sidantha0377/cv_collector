import "dotenv/config";
import { getTableClient, TABLE_NAMES } from "../lib/azure/table-client";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

// Extra tags mixed across candidates — all will also have "react"
const EXTRA_TAG_POOL = [
  ["typescript", "nextjs", "tailwindcss", "nodejs", "postgresql"],
  ["javascript", "vuejs", "graphql", "expressjs", "mongodb"],
  ["typescript", "redux", "restapi", "nodejs", "firebase"],
  ["react", "nextjs", "zustand", "tailwindcss", "vercel"],
  ["javascript", "svelte", "nuxtjs", "css", "websockets"],
  ["typescript", "angular", "rxjs", "nodejs", "mssql"],
  ["react", "gatsby", "graphql", "contentful", "netlify"],
  ["javascript", "nodejs", "expressjs", "mysql", "docker"],
  ["typescript", "nestjs", "postgresql", "redis", "kubernetes"],
  ["react", "redux", "jest", "cypress", "testing"],
  ["typescript", "react", "playwright", "vitest", "agile"],
  ["javascript", "nodejs", "kafka", "elasticsearch", "microservices"],
  ["python", "django", "postgresql", "redis", "docker"],
  ["python", "flask", "mongodb", "aws", "serverless"],
  ["typescript", "react", "aws", "dynamodb", "lambda"],
  ["javascript", "react", "firebase", "tailwindcss", "pwa"],
  ["typescript", "react", "graphql", "apollo", "prisma"],
  ["javascript", "react", "threejs", "webgl", "animation"],
  ["typescript", "nextjs", "stripe", "postgresql", "saas"],
  ["react", "reactnative", "expo", "firebase", "mobile"],
  ["typescript", "react", "storybook", "figma", "design"],
  ["javascript", "react", "webpack", "babel", "performance"],
  ["typescript", "react", "auth0", "oauth", "security"],
  ["react", "electron", "nodejs", "sqlite", "desktop"],
  ["typescript", "react", "docker", "githubactions", "cicd"],
  ["javascript", "nodejs", "grpc", "protobuf", "microservices"],
  ["typescript", "react", "tanstack", "zod", "forms"],
  ["react", "nextjs", "sanity", "cms", "seo"],
  ["typescript", "react", "recharts", "dashboard", "analytics"],
  ["javascript", "react", "socket.io", "websockets", "realtime"],
  ["typescript", "react", "testing", "jest", "tdd"],
  ["react", "remix", "prisma", "postgresql", "fullstack"],
  ["typescript", "react", "vite", "tailwindcss", "pnpm"],
  ["javascript", "react", "i18n", "localization", "accessibility"],
  ["typescript", "react", "zustand", "immer", "state"],
  ["react", "nextjs", "vercel", "edge", "performance"],
  ["typescript", "react", "openai", "ai", "chatbot"],
  ["javascript", "react", "mapbox", "geolocation", "maps"],
  ["typescript", "react", "pdf", "reporting", "exports"],
  ["react", "nextjs", "mdx", "blog", "markdown"],
  ["typescript", "react", "formik", "yup", "validation"],
  ["javascript", "react", "framer", "animation", "motion"],
  ["typescript", "react", "aws", "s3", "cloudfront"],
  ["react", "nextjs", "postgresql", "drizzle", "orm"],
  ["typescript", "react", "vitest", "msw", "testing"],
  ["javascript", "react", "pwa", "serviceworker", "offline"],
  ["typescript", "react", "monorepo", "turborepo", "nx"],
  ["react", "nextjs", "supabase", "postgresql", "auth"],
  ["typescript", "react", "shadcn", "radix", "ui"],
  ["javascript", "react", "d3", "visualization", "charts"],
];

interface CandidateRow {
  email: string;
  enotify: boolean;
  ftags: string; // JSON stringified array
}

function buildCandidates(): CandidateRow[] {
  return Array.from({ length: 50 }, (_, i) => {
    const n = i + 1;
    const email = `test${n}@mailinator.com`;

    // Always include "react"; merge with the pool entry (which may already contain react)
    const extraTags = EXTRA_TAG_POOL[i] ?? [];
    const tagSet = Array.from(new Set(["react", ...extraTags]));

    return {
      email,
      enotify: true,
      ftags: JSON.stringify(tagSet),
    };
  });
}

async function seedCandidates() {
  const client = getTableClient(TABLE_NAMES.CANDIDATES); // adjust table name as needed

  const candidates = buildCandidates();

  console.log(
    `\n🌱  Seeding ${candidates.length} candidates into Azure Table Storage...\n`,
  );

  const results = await Promise.allSettled(
    candidates.map(async (candidate) => {
      const entity = {
        partitionKey: DEFAULT_TENANT_ID,
        rowKey: candidate.email,
        email: candidate.email,
        enotify: candidate.enotify,
        ftags: candidate.ftags,
      };

      // Safe for re-runs — upsert will overwrite existing rows
      await client.upsertEntity(entity, "Replace");
      console.log(`  ✅  ${candidate.email}  tags: ${candidate.ftags}`);
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`\n❌  ${failed.length} candidate(s) failed to insert.\n`);
    (failed as PromiseRejectedResult[]).forEach((f) =>
      console.error("  →", f.reason),
    );
    process.exit(1);
  }

  console.log(
    `\n✅  All ${candidates.length} candidates seeded successfully.\n`,
  );
}

seedCandidates().catch((err) => {
  console.error("Fatal error during candidate seeding:", err);
  process.exit(1);
});
