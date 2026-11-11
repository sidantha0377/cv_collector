import { redirect } from "next/navigation";
import { getSession, parseSessionMeta } from "@/lib/auth/session";
import JobPostForm from "@/app/admin/components/JobPostForm";
import JobListView from "@/app/admin/components/JobListView";

export default async function AdminPage() {
  const session = await getSession();
  
  // Guard clause: ensure only admins can access
  if (!session || session.role !== "admin") {
    redirect("/");
  }
  const tenantId = "default";

  const meta = parseSessionMeta(session);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session.email}</p>
      </header>
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Current Job Openings</h2>
        <JobListView email={session.email} />
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
        <JobPostForm tenantId={tenantId} adminId={session.email} />
      </section>
    </div>
  );
}