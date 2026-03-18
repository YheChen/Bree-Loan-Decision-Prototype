import type { Application } from "@/types/application";
import { applications } from "@/data/applications";

export function getFlaggedApplications(): Application[] {
  return applications.filter((app) => app.decision === "flagged_for_review");
}
