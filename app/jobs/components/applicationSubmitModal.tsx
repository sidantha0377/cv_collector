"use client";

import { useState } from "react";
import type { JobEntity, CvEntity } from "@/lib/types/azure-tables";
import CVsuggest from "@/app/jobs/components/cvSuggest";

interface Props {
  selected: JobEntity;
  cvs: CvEntity[];
  candidateRowKey: string;
  candidateEmail: string;
  onClose: () => void;
  onApplied: (jobId: string) => void;
}

export default function ApplicationSubmitModal({
  selected,
  cvs,
  candidateRowKey,
  candidateEmail,
  onClose,
  onApplied,
}: Props) {
  const [selectedCv, setSelectedCv] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  function parseRequirements(raw: string | undefined): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  async function handleApply() {
    setApplying(true);
    setError("");

    try {
      const res = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selected.partitionKey,
          candidateRowKey,
          candidateEmail,
          jobId: selected.rowKey,
          cvId: selectedCv || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to apply");
      }

      onApplied(selected.rowKey);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4">
        <div>
          <h2 className="text-base font-medium text-gray-900">{selected.title}</h2>
          <p className="text-sm text-gray-500">
            {selected.company} · {selected.location}
          </p>
        </div>

        <div className="text-sm text-gray-600 max-h-32 overflow-y-auto leading-relaxed">
          {selected.description}
        </div>

        {selected.requirements && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
              Requirements
            </p>
            <ul className="flex flex-col gap-1">
              {parseRequirements(selected.requirements).map((req, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

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
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {applying ? "Applying..." : "Confirm apply"}
          </button>
        </div>
      </div>
    </div>
  );
}