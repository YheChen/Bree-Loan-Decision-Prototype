import type { Application } from "@/types/application";
import { applications } from "@/data/applications";

function getQueuePriority(application: Application) {
  if (application.extractionError === "no_documents_provided") {
    return 0;
  }

  if (application.score >= 65) {
    return 1;
  }

  if (application.loanAmount <= 500) {
    return 2;
  }

  return 3;
}

export function getFlaggedApplications(): Application[] {
  return applications
    .filter((app) => app.decision === "flagged_for_review")
    .sort((left, right) => {
      const priorityDifference =
        getQueuePriority(left) - getQueuePriority(right);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      if (left.score !== right.score) {
        return right.score - left.score;
      }

      if (left.loanAmount !== right.loanAmount) {
        return left.loanAmount - right.loanAmount;
      }

      return left.id.localeCompare(right.id);
    });
}
