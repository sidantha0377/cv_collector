"use client";

import { useState } from "react";
import type { CvEntity } from "@/lib/types/azure-tables";
import { uploadCV, deleteCV } from "@/lib/actions/cv";

interface Props {
  cvs: CvEntity[];
  userId: string;
}

export function CVSection({ cvs: initial, userId }: Props) {
  const [cvs, setCvs] = useState<CvEntity[]>(initial);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log( "uplode pdf :" ,formData);
      const newCV = await uploadCV(formData);
      setCvs((prev) => [newCV, ...prev]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = ""; 
    }
  }

  async function handleDelete(cvId: string) {
    console.log("Deleting CV with ID:", cvId);
    try {
      await deleteCV(cvId);
      setCvs((prev) => prev.filter((c) => c.rowKey !== cvId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800  p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
        Your CVs
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {cvs.map((cv) => (
  <div key={cv.rowKey} className="flex flex-col gap-1.5 p-3 rounded-lg border border-[#052e02] bg-[#eb3434]">
    <span className="text-base">📄</span>
    <p className="text-xs font-medium text-gray-900 truncate">{cv.fileName}</p>
    <p className="text-[11px] text-gray-400">{formatDate(cv.uploadedAt)}</p>
    <div className="flex gap-3 mt-1">
      <a
        href={` http://localhost:3000/api/cv/view/${cv.rowKey}`}   // ← SAS URL generated server-side
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-gray-500 hover:text-gray-900 hover:underline"
      >
        View
      </a>
      <button
        onClick={() => handleDelete(cv.rowKey)}
        className="text-[11px] text-gray-500 hover:text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  </div>
))}

        {/* Upload card with Group Hover Fix */}
        <label className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-neutral-800 cursor-pointer hover:bg-[#052e02] hover:border-[#052e02] transition-all min-h-[140px]">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <div className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center group-hover:border-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 13 13" fill="none" className="transition-colors">
              <path
                d="M6.5 1v7M3 4.5L6.5 1 10 4.5M1.5 10h10"
                className="stroke-gray-400 group-hover:stroke-white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {uploading ? "Uploading..." : "Upload new CV"}
            </p>
            <p className="text-[11px] text-gray-500 group-hover:text-gray-200 transition-colors">
              PDF, max 5MB
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}