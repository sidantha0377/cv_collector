"use client";

import { useEffect, useState } from "react";
import type { JobEntity, CvEntity } from "@/lib/types/azure-tables";
import ApplicationSubmitModal from "@/app/jobs/components/applicationSubmitModal";

interface Props {
  appliedJobIds: Set<string>;
  candidateRowKey: string;
  candidateEmail: string;
}

const typeStyles: Record<string, string> = {
  "full-time": "bg-blue-50 text-blue-700",
  "part-time": "bg-purple-50 text-purple-700",
  contract: "bg-amber-50 text-amber-700",
  remote: "bg-green-50 text-green-700",
};

export function JobListings({
  appliedJobIds,
  candidateRowKey,
  candidateEmail,
}: Props) {
  const [jobs, setJobs] = useState<JobEntity[]>([]);
  const [cvs, setCvs] = useState<CvEntity[]>([]);
  const [applied, setApplied] = useState<Set<string>>(appliedJobIds);
  const [selected, setSelected] = useState<JobEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [jobsRes, cvsRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/cv/list"),
        ]);

        if (!jobsRes.ok) {
          throw new Error(`Failed to load jobs (${jobsRes.status})`);
        }
        if (!cvsRes.ok) {
          throw new Error(`Failed to load CVs (${cvsRes.status})`);
        }

        const jobsData = (await jobsRes.json()) as JobEntity[];
        const cvsData = (await cvsRes.json()) as CvEntity[];

        if (!ignore) {
          setJobs(Array.isArray(jobsData) ? jobsData : []);
          setCvs(Array.isArray(cvsData) ? cvsData : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading jobs...</p>;
  }

  return (
    <>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        {jobs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No jobs available right now.
          </p>
        )}

        {jobs.map((job) => {
          const hasApplied = applied.has(job.rowKey);

          return (
            <div
              key={job.rowKey}
              className="rounded-xl border bg-white border-gray-200 p-5 flex items-start justify-between gap-4"
            >
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-medium text-gray-900">{job.title}</h2>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                      typeStyles[job.type] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.type}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {job.company} · {job.location}
                </p>

                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{job.description}</p>

                <p className="text-[11px] text-gray-300 mt-1">
                  Posted {formatDate(job.postedAt)}
                  {job.closingAt && ` · Closes ${formatDate(job.closingAt)}`}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!hasApplied) {
                    setSelected(job);
                  }
                }}
                disabled={hasApplied}
                className={`shrink-0 text-xs px-4 py-2 rounded-lg border transition-colors ${
                  hasApplied
                    ? "border-green-200 bg-green-50 text-green-700 cursor-default"
                    : "border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                }`}
              >
                {hasApplied ? "Applied" : "Apply"}
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <ApplicationSubmitModal
          selected={selected}
          cvs={cvs}
          candidateRowKey={candidateRowKey}
          candidateEmail={candidateEmail}
          onClose={() => setSelected(null)}
          onApplied={(jobId) => {
            setApplied((prev) => new Set([...prev, jobId]));
          }}
        />
      )}
    </>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}