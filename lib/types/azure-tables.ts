export interface BaseEntity {
  partitionKey: string;
  rowKey: string;
  timestamp?: Date;
  etag?: string;
}

export interface OtpRecordEntity extends BaseEntity {
  email: string;
  otpCode: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface SessionEntity extends BaseEntity {
  sessionId: string;
  email: string;
  role: "candidate" | "admin";
  tenantId: string;
  expiresAt: string;
  createdAt: string;
  metaJson?: string;
}

export interface CvEntity extends BaseEntity {
  fileName: string;
  blobName: string;
  url: string;
  uploadedAt: string;
  content: string;
}

export interface ApplicationEntity extends BaseEntity {
  // partitionKey = candidateRowKey (session.rowKey)
  // rowKey       = applicationId (uuid)
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: "pending" | "review" | "accepted" | "rejected";
  appliedAt: string;
  cvId?: string; // which CV was submitted
  metaJson?: string; // any extra fields later
}

export interface JobEntity extends BaseEntity {
  // partitionKey = tenantId
  // rowKey       = jobId (uuid)
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  requirements: string; // stored as JSON string array
  postedAt: string;
  closingAt?: string;
  isActive: boolean;
  adminId: string;
  tags: string;
  notify: boolean;
  notifyStates: "not_selected" | "pending" | "complet";
}

export interface AdminEntity extends BaseEntity {
  email: string;
  createdAt: string;
  createdBy: string; // email of the admin who added this admin (or "seed" for seeded)
}

export interface TagsEntity extends BaseEntity {
  tag: string;
  count: number;
}

export interface CandidateEntity extends BaseEntity {
  email: string;
  enotify: boolean;
  ftags: string;
}
