export type ApplicationStatus =
  | "APPLIED"
  | "RECRUITER_SCREEN"
  | "HM_SCREEN"
  | "ONSITE"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

const db: Record<string, JobApplication[]> = {}; // keyed by userId

export function listApplications(userId: string): JobApplication[] {
  return db[userId] ?? [];
}

export function createApplication(
  userId: string,
  app: Omit<JobApplication, "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const record: JobApplication = { ...app, createdAt: now, updatedAt: now };
  db[userId] = [...(db[userId] ?? []), record];
  return record;
}