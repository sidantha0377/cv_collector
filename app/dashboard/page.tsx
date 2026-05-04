import { redirect } from "next/navigation";
import { getSession, parseSessionMeta } from "@/lib/auth/session";
import { cvRepository,} from "@/lib/repositories/cvRepository";
import {applicationRepository } from "@/lib/repositories/applicationRepository";
import { UserCard } from "./components/UserCard";
import { AppliedJobs } from "./components/AppliedJobs";
import { CVSection } from "./components/CVSection";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const meta = parseSessionMeta(session);
  const cvs = await cvRepository.listByUser(session.email);
  const applications = await applicationRepository.listByCandidate(session.email);

  return (
    // Main background wrapper to cover the whole screen in dark mode
    <div className="min-h-screen  text-[#052e02] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {meta.name ?? session.email}
          </h1>
          <p className="text-gray-500">
            Here's an overview of your job applications and CVs.
          </p>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: User Profile Card (Fixed Width roughly) */}
          <div className="lg:col-span-4">
            <UserCard
              session={session}
              applicationCount={applications.length}
              cvCount={cvs.length}
            />
          </div>

          {/* Right Column: Applied Jobs & CVs (Flexible) */}
          <div className="lg:col-span-8 space-y-8">
            <div className=" rounded-2xl border border-[#052e02] p-6 shadow-sm">
              <AppliedJobs applications={applications} />
            </div>
            
            <div className=" rounded-2xl border border-[#052e02] p-6 shadow-sm">
              <CVSection cvs={cvs} userId={session.email} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}