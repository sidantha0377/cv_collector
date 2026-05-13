import type { JobEntity } from "@/lib/types/azure-tables";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function buildJobNotificationEmailHtml(
  job: JobEntity,
  jobUrl: string,
): string {
  const requirements = (JSON.parse(job.requirements || "[]") as string[])
    .map((r) => `<li style="margin-bottom:4px;">${r}</li>`)
    .join("");

  const tags = (JSON.parse(job.tags || "[]") as string[])
    .map(
      (t) =>
        `<span style="display:inline-block;background:#f0f4ff;color:#3b5bdb;` +
        `border-radius:4px;padding:2px 8px;font-size:12px;margin:2px;">${t}</span>`,
    )
    .join(" ");

  const closingLine = job.closingAt
    ? `<p style="color:#868e96;font-size:13px;margin:0 0 20px;">
         ⏰ Applications close on
         <strong>${new Date(job.closingAt).toLocaleDateString("en-GB", {
           day: "numeric",
           month: "long",
           year: "numeric",
         })}</strong>
       </p>`
    : "";

  const unsubscribeUrl = `${BASE_URL}/profile#notifications`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Job Match</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#f8f9fa;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);
                      max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b5bdb 0%,#1971c2 100%);
                        padding:32px 40px;">
              <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;
                         letter-spacing:1px;text-transform:uppercase;">
                New Job Match
              </p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;
                          font-weight:700;line-height:1.3;">
                ${job.title}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
                ${job.company}&nbsp;&nbsp;·&nbsp;&nbsp;${job.location}&nbsp;&nbsp;·&nbsp;&nbsp;${job.type}
              </p>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:32px 40px;">

              ${tags ? `<div style="margin-bottom:20px;">${tags}</div>` : ""}

              <h2 style="margin:0 0 10px;font-size:16px;color:#212529;">
                About the role
              </h2>
              <p style="margin:0 0 20px;color:#495057;font-size:15px;line-height:1.65;">
                ${job.description}
              </p>

              ${
                requirements
                  ? `<h2 style="margin:0 0 10px;font-size:16px;color:#212529;">
                       Requirements
                     </h2>
                     <ul style="margin:0 0 24px;padding-left:20px;color:#495057;
                                font-size:15px;line-height:1.8;">
                       ${requirements}
                     </ul>`
                  : ""
              }

              ${closingLine}

              <!-- ── CTA button ── -->
              <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr>
                  <td style="border-radius:8px;background:#3b5bdb;">
                    <a href="${jobUrl}"
                       style="display:inline-block;padding:14px 32px;
                              color:#ffffff;font-size:15px;font-weight:600;
                              text-decoration:none;letter-spacing:0.3px;">
                      View &amp; Apply →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f1f3f5;">
              <p style="margin:0;color:#adb5bd;font-size:12px;line-height:1.6;">
                You're receiving this because you enabled job-match alerts on your profile.<br/>
                <a href="${unsubscribeUrl}"
                   style="color:#868e96;text-decoration:underline;">
                  Manage notification preferences
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildJobNotificationEmailText(
  job: JobEntity,
  jobUrl: string,
): string {
  const requirements = (JSON.parse(job.requirements || "[]") as string[])
    .map((r) => `  • ${r}`)
    .join("\n");

  const closing = job.closingAt
    ? `Applications close: ${new Date(job.closingAt).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "long", year: "numeric" },
      )}\n\n`
    : "";

  const unsubscribeUrl = `${BASE_URL}/profile#notifications`;

  return [
    `NEW JOB MATCH: ${job.title}`,
    `${job.company}  |  ${job.location}  |  ${job.type}`,
    "",
    job.description,
    "",
    requirements ? `Requirements:\n${requirements}\n` : "",
    closing,
    `Apply here: ${jobUrl}`,
    "",
    "---",
    "You're receiving this because you enabled job-match alerts.",
    `Manage preferences: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}
