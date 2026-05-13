"use client";

import { useEffect, useMemo, useState } from "react";
import { JobApi } from "./jobType";

function safeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    // If backend ever stores plain comma-separated text, show as one chip
    return [value];
  }
}

function formatIso(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

type Props = {
  email: string;
};

export default function JobListView({ email }: Props) {
  const [jobs, setJobs] = useState<JobApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = useMemo(() => {
    const qs = new URLSearchParams({ email });
    return `/api/jobs/admin?${qs.toString()}`;
  }, [email]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
        }

        const data = (await res.json()) as unknown;
        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response (expected an array)");
        }

        if (!cancelled) setJobs(data as JobApi[]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load jobs";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading jobs…</div>;
  }

  if (error) {
    return (
      <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <div className="p-4 text-sm text-gray-600">No jobs found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 w-[220px]">Title</th>
            <th className="p-3 w-[160px]">Company</th>
            <th className="p-3 w-[140px]">Location</th>
            <th className="p-3 w-[120px]">Type</th>
            <th className="p-3 w-[110px]">Active</th>
            <th className="p-3 w-[170px]">Posted</th>
            <th className="p-3 w-[170px]">Closing</th>
            <th className="p-3 w-[220px]">IDs</th>
            <th className="p-3">Details</th>
            <th className="p-3 w-[160px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => {
            const requirements = safeJsonArray(job.requirements);
            const tags = safeJsonArray(job.tags);

            return (
              <tr key={job.rowKey} className="border-b align-top hover:bg-gray-50">
                <td className="p-3 font-medium">{job.title}</td>
                <td className="p-3">{job.company}</td>
                <td className="p-3">{job.location}</td>
                <td className="p-3">{job.type}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      job.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-3 text-sm text-gray-700">{formatIso(job.postedAt)}</td>
                <td className="p-3 text-sm text-gray-700">{formatIso(job.closingAt)}</td>

                <td className="p-3 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold">rowKey:</span>{" "}
                    <span className="break-all">{job.rowKey}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">partitionKey:</span>{" "}
                    <span className="break-all">{job.partitionKey}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">adminId:</span>{" "}
                    <span className="break-all">{job.adminId}</span>
                  </div>
                  {job.timestamp ? (
                    <div className="mt-1">
                      <span className="font-semibold">timestamp:</span>{" "}
                      <span className="break-all">{job.timestamp}</span>
                    </div>
                  ) : null}
                  {job.etag ? (
                    <div className="mt-1">
                      <span className="font-semibold">etag:</span>{" "}
                      <span className="break-all">{job.etag}</span>
                    </div>
                  ) : null}
                </td>

                <td className="p-3 text-sm">
                
                  <div className="font-semibold text-gray-900 mb-1">Description</div>
                  <div className="whitespace-pre-wrap text-gray-800">{job.description}</div>
                  
                  <div className="font-semibold text-gray-900 mb-1">Notify Status</div>
                  <div className="whitespace-pre-wrap text-gray-800">{job.notifyStates}</div>
                  
                  <div className="font-semibold text-gray-900 mt-3 mb-1">Requirements</div>
                  <div className="flex flex-wrap gap-1">
                    {requirements.length ? (
                      requirements.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800"
                        >
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>

                  <div className="font-semibold text-gray-900 mt-3 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {tags.length ? (
                      tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-800"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>
                </td>

                <td className="p-3">
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    Edit
                  </button>
                  <button
                    // onClick={() => handleDelete(job.rowKey)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >  Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}