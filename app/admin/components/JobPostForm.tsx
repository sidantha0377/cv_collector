"use client";

import { useState } from "react";
import TagSelector from "@/app/admin/components/tagSelector";

type JobType = "full-time" | "part-time" | "contract" | "internship";

export default function JobPostForm(props: {
  tenantId: string;
  adminId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notify, setNotify] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;

    setMessage(null);
    setIsSubmitting(true);

    try {
      const form = new FormData(formEl);

      const title = String(form.get("title") ?? "").trim();
      const company = String(form.get("company") ?? "").trim();
      const location = String(form.get("location") ?? "").trim();
      const type = String(form.get("type") ?? "").trim() as JobType;
      const description = String(form.get("description") ?? "").trim();
      const closingAtRaw = String(form.get("closingAt") ?? "").trim();

      const requirementsRaw = String(form.get("requirements") ?? "");
      const requirements = requirementsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        tenantId: props.tenantId,
        adminId: props.adminId,
        title,
        company,
        location,
        type,
        description,
        requirements,
        tags: selectedTags,
        closingAt: closingAtRaw ? new Date(closingAtRaw).toISOString() : undefined,
        notify,
      };

      const res = await fetch("/api/jobs/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed (${res.status}): ${text}`);
      }

      await res.json();

      setMessage("Job created successfully.");
      formEl.reset();
      setNotify(false);
      setSelectedTags([]);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        name="title"
        placeholder="Job Title"
        className="p-2 border rounded"
        required
        disabled={isSubmitting}
      />

      <input
        name="company"
        placeholder="Company"
        className="p-2 border rounded"
        required
        disabled={isSubmitting}
      />

      <input
        name="location"
        placeholder="Location"
        className="p-2 border rounded"
        required
        disabled={isSubmitting}
      />

      <select
        name="type"
        className="p-2 border rounded"
        required
        defaultValue="full-time"
        disabled={isSubmitting}
      >
        <option value="full-time">full-time</option>
        <option value="part-time">part-time</option>
        <option value="contract">contract</option>
        <option value="internship">internship</option>
      </select>

      <textarea
        name="requirements"
        placeholder={"Requirements (one per line)\nReact\nTypeScript"}
        className="p-2 border rounded md:col-span-2"
        rows={4}
        required
        disabled={isSubmitting}
      />

      <div className="md:col-span-2">
        <TagSelector
          tenantId={props.tenantId}
          value={selectedTags}
          onChange={setSelectedTags}
          disabled={isSubmitting}
        />
      </div>

      <input
        name="closingAt"
        type="datetime-local"
        className="p-2 border rounded md:col-span-2"
        disabled={isSubmitting}
      />

      <textarea
        name="description"
        placeholder="Job Description"
        className="p-2 border rounded md:col-span-2"
        rows={6}
        required
        disabled={isSubmitting}
      />

      <div className="md:col-span-2 flex items-center gap-2">
        <input
          type="checkbox"
          id="notifyByTagEmail"
          name="notifyByTagEmail"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="notifyByTagEmail" className="text-sm text-gray-700">
          Enable email notifications for tag matches
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition md:col-span-2 disabled:opacity-60"
      >
        {isSubmitting ? "Publishing..." : "Publish Job"}
      </button>

      {message ? <div className="md:col-span-2 text-sm">{message}</div> : null}
    </form>
  );
}