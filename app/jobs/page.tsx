import { redirect } from "next/navigation";
import { JobListings } from "./components/jobList";
import { applicationRepository } from "@/lib/repositories/applicationRepository";
import { getSession } from "@/lib/auth/session";

export default async function JobsPage() {
  
  const session = await getSession();
  if (!session) redirect("/");

  const applications = await applicationRepository.listByCandidate(session.rowKey);
  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-medium">Browse Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find and apply for your next opportunity.
        </p>
      </div>
      <JobListings appliedJobIds={appliedJobIds} candidateRowKey={session.rowKey} />
    </div>
  );
}