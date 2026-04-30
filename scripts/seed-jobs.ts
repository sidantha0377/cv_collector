import "dotenv/config";
import { getTableClient, TABLE_NAMES } from "../lib/azure/table-client";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

const jobs = [
  {
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Build modern web interfaces using React and Next.js. Work closely with designers and backend engineers to deliver great user experiences.",
    requirements: JSON.stringify([
      "3+ years React experience",
      "TypeScript proficiency",
      "Tailwind CSS",
      "REST API integration",
    ]),
    closingAt: "2026-06-01T00:00:00.000Z",
  },
  {
    title: "Backend Engineer",
    company: "CloudSystems",
    location: "Remote",
    type: "remote",
    description:
      "Design and build scalable APIs and microservices. Own infrastructure on Azure and contribute to architecture decisions.",
    requirements: JSON.stringify([
      "Node.js / Python",
      "Azure or AWS experience",
      "SQL and NoSQL databases",
      "Docker & CI/CD",
    ]),
    closingAt: "2026-06-15T00:00:00.000Z",
  },
  {
    title: "UI/UX Designer",
    company: "Pixel Studio",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Create intuitive and beautiful product experiences. Lead design sprints, produce wireframes, prototypes, and final assets.",
    requirements: JSON.stringify([
      "Figma expert",
      "3+ years product design",
      "User research experience",
      "Design systems knowledge",
    ]),
    closingAt: "2026-05-20T00:00:00.000Z",
  },
  {
    title: "Full Stack Engineer",
    company: "StartupX",
    location: "Gampaha, LK",
    type: "full-time",
    description:
      "Join a fast-moving startup building fintech products. Work across the entire stack from database to UI.",
    requirements: JSON.stringify([
      "React & Node.js",
      "PostgreSQL",
      "Azure deployment",
      "Agile environment",
    ]),
    closingAt: "2026-06-30T00:00:00.000Z",
  },
  {
    title: "DevOps Engineer",
    company: "InfraNet",
    location: "Remote",
    type: "remote",
    description:
      "Manage CI/CD pipelines, cloud infrastructure, and monitoring. Improve deployment speed and system reliability.",
    requirements: JSON.stringify([
      "Azure DevOps",
      "Kubernetes",
      "Terraform",
      "Monitoring with Grafana/Prometheus",
    ]),
    closingAt: "2026-07-01T00:00:00.000Z",
  },
  {
    title: "Data Analyst",
    company: "InsightCo",
    location: "Kandy, LK",
    type: "full-time",
    description:
      "Analyse business data to drive decisions. Build dashboards, run queries, and present findings to stakeholders.",
    requirements: JSON.stringify([
      "SQL proficiency",
      "Power BI or Tableau",
      "Excel advanced",
      "Python basics",
    ]),
    closingAt: "2026-05-31T00:00:00.000Z",
  },
  {
    title: "Mobile Developer (React Native)",
    company: "AppWorks",
    location: "Remote",
    type: "remote",
    description:
      "Build cross-platform mobile apps for iOS and Android using React Native. Collaborate with product and design teams.",
    requirements: JSON.stringify([
      "React Native 2+ years",
      "TypeScript",
      "App Store & Play Store deployment",
      "REST APIs",
    ]),
    closingAt: "2026-06-10T00:00:00.000Z",
  },
  {
    title: "QA Engineer",
    company: "QualityFirst",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Own quality assurance across web and mobile products. Write automated tests and perform manual testing.",
    requirements: JSON.stringify([
      "Playwright or Cypress",
      "API testing (Postman)",
      "Bug tracking tools",
      "SDLC knowledge",
    ]),
    closingAt: "2026-06-20T00:00:00.000Z",
  },
  {
    title: "Product Manager",
    company: "BuildRight",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Define product vision and roadmap. Work with engineering, design, and business teams to ship features users love.",
    requirements: JSON.stringify([
      "3+ years PM experience",
      "Agile/Scrum",
      "Data-driven decision making",
      "Stakeholder management",
    ]),
    closingAt: "2026-07-15T00:00:00.000Z",
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureNet",
    location: "Remote",
    type: "contract",
    description:
      "Monitor systems for security threats, conduct vulnerability assessments, and implement security best practices.",
    requirements: JSON.stringify([
      "SIEM tools",
      "Network security",
      "Penetration testing basics",
      "ISO 27001 knowledge",
    ]),
    closingAt: "2026-05-25T00:00:00.000Z",
  },
  {
    title: "Machine Learning Engineer",
    company: "AILabs",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Build and deploy ML models to production. Work on NLP and computer vision projects with real business impact.",
    requirements: JSON.stringify([
      "Python & PyTorch/TensorFlow",
      "MLOps experience",
      "Azure ML or SageMaker",
      "Statistics fundamentals",
    ]),
    closingAt: "2026-08-01T00:00:00.000Z",
  },
  {
    title: "Technical Support Engineer",
    company: "SupportHub",
    location: "Galle, LK",
    type: "full-time",
    description:
      "Provide technical support to enterprise clients. Diagnose issues, write runbooks, and escalate when needed.",
    requirements: JSON.stringify([
      "Linux/Windows administration",
      "Networking basics",
      "Customer communication",
      "Ticketing systems",
    ]),
    closingAt: "2026-06-05T00:00:00.000Z",
  },
  {
    title: "Cloud Architect",
    company: "SkyInfra",
    location: "Remote",
    type: "contract",
    description:
      "Design and oversee Azure cloud architecture for enterprise clients. Lead migrations and modernisation projects.",
    requirements: JSON.stringify([
      "Azure Solutions Architect certified",
      "8+ years experience",
      "Cost optimisation",
      "Enterprise networking",
    ]),
    closingAt: "2026-07-20T00:00:00.000Z",
  },
  {
    title: "Scrum Master",
    company: "AgileWorks",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Facilitate agile ceremonies, remove blockers, and coach teams on Scrum practices. Drive continuous improvement.",
    requirements: JSON.stringify([
      "CSM or PSM certified",
      "3+ years Scrum Master experience",
      "Jira/Confluence",
      "Servant leadership",
    ]),
    closingAt: "2026-06-25T00:00:00.000Z",
  },
  {
    title: "React Native Developer",
    company: "MobileFirst",
    location: "Negombo, LK",
    type: "part-time",
    description:
      "Part-time role building mobile features for a growing e-commerce app. Flexible hours, fully remote-friendly.",
    requirements: JSON.stringify([
      "React Native",
      "Redux or Zustand",
      "Firebase",
      "20hrs/week availability",
    ]),
    closingAt: "2026-05-30T00:00:00.000Z",
  },
  {
    title: "Database Administrator",
    company: "DataVault",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Manage and optimise SQL and NoSQL databases. Ensure availability, performance, and security of all data stores.",
    requirements: JSON.stringify([
      "SQL Server / PostgreSQL",
      "Azure SQL",
      "Backup & recovery",
      "Performance tuning",
    ]),
    closingAt: "2026-07-10T00:00:00.000Z",
  },
  {
    title: "Graphic Designer",
    company: "CreativeBox",
    location: "Kandy, LK",
    type: "part-time",
    description:
      "Create visual content for digital and print. Design social media assets, marketing materials, and brand collateral.",
    requirements: JSON.stringify([
      "Adobe Illustrator & Photoshop",
      "Brand identity experience",
      "Portfolio required",
      "25hrs/week",
    ]),
    closingAt: "2026-06-08T00:00:00.000Z",
  },
  {
    title: "IT Project Manager",
    company: "ProManage",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Lead end-to-end delivery of IT projects for government and enterprise clients. Manage budgets, timelines, and teams.",
    requirements: JSON.stringify([
      "PMP certified",
      "5+ years IT PM experience",
      "MS Project / Jira",
      "Risk management",
    ]),
    closingAt: "2026-08-15T00:00:00.000Z",
  },
  {
    title: "Content Writer (Tech)",
    company: "WriteTech",
    location: "Remote",
    type: "contract",
    description:
      "Write technical blog posts, documentation, and marketing content for SaaS products. Must understand developer audiences.",
    requirements: JSON.stringify([
      "Technical writing portfolio",
      "Developer background preferred",
      "SEO knowledge",
      "Markdown",
    ]),
    closingAt: "2026-06-12T00:00:00.000Z",
  },
  {
    title: "Business Analyst",
    company: "AnalyticsPro",
    location: "Colombo, LK",
    type: "full-time",
    description:
      "Bridge the gap between business and IT. Gather requirements, model processes, and support delivery of technology solutions.",
    requirements: JSON.stringify([
      "Requirements elicitation",
      "UML / BPMN",
      "SQL basics",
      "Stakeholder workshops",
    ]),
    closingAt: "2026-07-05T00:00:00.000Z",
  },
];

async function seedJobs() {
  const client = getTableClient(TABLE_NAMES.JOBS);
  const postedAt = new Date().toISOString();

  console.log(
    `\n🌱  Seeding ${jobs.length} jobs into Azure Table Storage...\n`,
  );

  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      const entity = {
        partitionKey: DEFAULT_TENANT_ID,
        rowKey: uuidv4(),
        ...job,
        postedAt,
        isActive: true,
      };

      await client.upsertEntity(entity, "Replace");
      console.log(`  ✅  ${job.title} @ ${job.company}`);
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`\n❌  ${failed.length} job(s) failed to insert.\n`);
    process.exit(1);
  }

  console.log(`\n✅  All ${jobs.length} jobs seeded successfully.\n`);
}

seedJobs().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
