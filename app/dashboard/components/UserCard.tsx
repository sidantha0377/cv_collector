
"use client";

import type { SessionEntity } from "@/lib/types/azure-tables";
import { parseSessionMeta } from "@/lib/auth/session-utils";

interface Props {
  session: SessionEntity;
  applicationCount: number;
  cvCount: number;
}

export function UserCard({ session, applicationCount, cvCount }: Props) {
  const meta = parseSessionMeta(session);

  const displayName = meta.name ?? session.email;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-[#052e02] p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-[#052e02] mb-3">
        Your profile
      </p>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-lg mb-3">
        {initials}
      </div>

      <p className="font-medium text-[#052e02]">{displayName}</p>
      <p className="text-sm text-[#052e02]">{session.email}</p>

      {/* Fields */}
      <div className="mt-4 pt-4 border-t border-[#052e02] flex flex-col gap-3">
        {meta.phone && (
          <div className="flex justify-between text-sm">
            <span className="text-[#052e02]">Phone</span>
            <span className="font-medium text-[#052e02]">{meta.phone}</span>
          </div>
        )}
        {meta.location && (
          <div className="flex justify-between text-sm">
            <span className="text-[#052e02]">Location</span>
            <span className="font-medium text-[#052e02]">{meta.location}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#052e02]">Applications</span>
          <span className="font-medium text-[#052e02]">{applicationCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#052e02]">CVs uploaded</span>
          <span className="font-medium text-[#052e02]">{cvCount}</span>
        </div>
      </div>

      <button className="mt-4 w-full py-2 text-sm border border-[#052e02] rounded-lg hover:bg-[#052e02] hover:text-white transition-colors">
        Edit profile
      </button>
    </div>
  );
}