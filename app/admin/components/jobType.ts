export interface JobApi {
  etag?: string;
  partitionKey: string;
  rowKey: string;
  timestamp?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string; // JSON string in your sample
  tags: string; // JSON string in your sample
  adminId: string;
  postedAt: string;
  closingAt?: string;
  isActive: boolean;
  notify: boolean;
  notifyStates: string;
}
