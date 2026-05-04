import { Application } from "@/lib/service/applications/applications-service";
import Link from "next/link";

interface Props {
  applications: Application[];
}

const statusStyles: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700",
  review:   "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending:  "Pending",
  review:   "In review",
  accepted: "Accepted",
  rejected: "Not selected",
};

export function AppliedJobs({ applications }: Props) {
  return (
    <div className="rounded-xl border border-[#052e02] p-5">
      <p className="text-2xs font-bold uppercase tracking-widest text-[#052e02] mb-4">
        Applied jobs
      </p>

      {applications.length === 0 ? (
        <p className="text-sm text-[#052e02] py-4 text-center">
          No applications yet.{" "}
          <Link href="/jobs" className="text-blue-600 hover:underline">
            Browse jobs
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-[#052e02]">{app.jobTitle}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {app.company} · Applied {formatDate(app.appliedAt)}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  statusStyles[app.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabels[app.status] ?? app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date: string | Date) {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    "day"
  );
}