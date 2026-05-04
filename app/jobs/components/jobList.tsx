"use client";

import { useState, useEffect } from "react";
import type { JobEntity ,CvEntity } from "@/lib/types/azure-tables";
import CVsuggest from "@/app/jobs/components/cvSuggest";

interface Props {
  appliedJobIds: Set<string>;
  candidateRowKey: string;
}

const typeStyles: Record<string, string> = {
  "full-time": "bg-blue-50 text-blue-700",
  "part-time": "bg-purple-50 text-purple-700",
  "contract":  "bg-amber-50 text-amber-700",
  "remote":    "bg-green-50 text-green-700",
};

export function JobListings({ appliedJobIds, candidateRowKey }: Props) {
  const [jobs, setJobs]           = useState<JobEntity[]>([]);
  const [cvs, setCvs]             = useState<CvEntity[]>([]);
  const [applied, setApplied]     = useState<Set<string>>(appliedJobIds);
  const [applying, setApplying]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<JobEntity | null>(null);
  const [selectedCv, setSelectedCv] = useState<string>("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function load() {
      const [jobsRes, cvsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/cv/list"),
      ]);
      const jobsData = await jobsRes.json();
      const cvsData  = await cvsRes.json();
      setJobs(jobsData);
      setCvs(cvsData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleApply() {
    if (!selected) return;
    setApplying(selected.rowKey);
    setError("");
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selected.rowKey, cvId: selectedCv || undefined }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      setApplied((prev) => new Set([...prev, selected.rowKey]));
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading jobs...</p>;
  }

  return (
    <>
      {/* Job list */}
      <div className="flex  flex-col gap-3">
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
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${typeStyles[job.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {job.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{job.description}</p>
                <p className="text-[11px] text-gray-300 mt-1">
                  Posted {formatDate(job.postedAt)}
                  {job.closingAt && ` · Closes ${formatDate(job.closingAt)}`}
                </p>
              </div>

              <button
                onClick={() => !hasApplied && setSelected(job)}
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

      {/* Apply modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4">
            <div>
              <h2 className="text-base font-medium text-gray-900">{selected.title}</h2>
              <p className="text-sm text-gray-500">{selected.company} · {selected.location}</p>
            </div>

            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto leading-relaxed">
              {selected.description}
            </div>

            {/* Requirements */}
            {selected.requirements && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Requirements</p>
                <ul className="flex flex-col gap-1">
                  {(JSON.parse(selected.requirements) as string[]).map((req, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2">
                      <span className="text-gray-300 mt-0.5">—</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CV selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Select CV (optional)</label>
              <select
                value={selectedCv}
                onChange={(e) => setSelectedCv(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
              >
                <option value="">No CV selected</option>
                {cvs.map((cv) => (
                  <option key={cv.rowKey} value={cv.rowKey}>
                    {cv.fileName}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
                <CVsuggest userId={candidateRowKey} jobId={selected.rowKey} />
              <button
                onClick={() => setSelected(null)}
                className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!!applying}
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {applying ? "Applying..." : "Confirm apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}