import { applicationRepository } from "@/lib/repositories/applicationRepository";
import type { ApplicationEntity } from "../../types/azure-tables";

export type Application = ApplicationEntity;

export async function getApplicationsByCandidate(
  candidateRowKey: string,
): Promise<Application[]> {
  return applicationRepository.listByCandidate(candidateRowKey);
}
