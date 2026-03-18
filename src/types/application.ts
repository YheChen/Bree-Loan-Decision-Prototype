export type EmploymentStatus = "employed" | "self-employed";

export type ApplicationDecision =
  | "approved"
  | "denied"
  | "flagged_for_review";

export type ExtractionError = "no_documents_provided";

export type ScoreFactorKey =
  | "incomeVerification"
  | "incomeLevel"
  | "accountStability"
  | "employmentStatus"
  | "debtToIncome";

export type ScoreFactor = {
  weight: number;
  score: number;
  note: string;
};

export type ScoreBreakdown = Record<ScoreFactorKey, ScoreFactor>;

export type Application = {
  id: string;
  applicant: string;
  email: string;
  loanAmount: number;
  statedMonthlyIncome: number;
  employmentStatus: EmploymentStatus;
  documents: string[];
  score: number;
  decision: ApplicationDecision;
  extractionError?: ExtractionError;
  breakdown: ScoreBreakdown;
};
