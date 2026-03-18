import type {
  Application,
  EmploymentStatus,
  ScoreBreakdown,
} from "@/types/application";

export type MockApplicationInput = {
  applicant: string;
  documents: string[];
  email: string;
  employmentStatus: EmploymentStatus;
  id?: string;
  loanAmount: number;
  statedMonthlyIncome: number;
};

export type RouteSearchParams = Record<string, string | string[] | undefined>;

const STRONG_PAY_STUB = "pay_stub_strong.pdf";
const WEAK_PAY_STUB = "pay_stub_weak.pdf";
const HEALTHY_BANK_STATEMENT = "bank_statement_healthy.pdf";
const RISKY_BANK_STATEMENT = "bank_statement_risky.pdf";

function readString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeDocuments(documents: string[]) {
  return [...new Set(documents.filter(Boolean))];
}

function roundCurrency(value: number) {
  return Math.max(0, Math.round(value));
}

function getVerifiedIncome(
  statedMonthlyIncome: number,
  documents: string[],
): number {
  if (documents.includes(STRONG_PAY_STUB)) {
    return statedMonthlyIncome;
  }

  if (documents.includes(WEAK_PAY_STUB)) {
    return Math.min(Math.round(statedMonthlyIncome * 0.9), 1400);
  }

  return 0;
}

function buildScoreBreakdown(
  statedMonthlyIncome: number,
  loanAmount: number,
  employmentStatus: EmploymentStatus,
  documents: string[],
): ScoreBreakdown {
  const verifiedIncome = getVerifiedIncome(statedMonthlyIncome, documents);
  const ratio = loanAmount > 0 ? verifiedIncome / loanAmount : 0;
  const hasStrongPayStub = documents.includes(STRONG_PAY_STUB);
  const hasWeakPayStub = documents.includes(WEAK_PAY_STUB);
  const hasHealthyBankStatement = documents.includes(HEALTHY_BANK_STATEMENT);
  const hasRiskyBankStatement = documents.includes(RISKY_BANK_STATEMENT);
  const hasAnyPayStub = hasStrongPayStub || hasWeakPayStub;

  const incomeVerification = (() => {
    if (!hasAnyPayStub) {
      return {
        weight: 0.3,
        score: 0,
        note: "No pay stub was provided to verify monthly income.",
      };
    }

    if (hasStrongPayStub) {
      return {
        weight: 0.3,
        score: 95,
        note: "Documented income aligns closely with the stated monthly income.",
      };
    }

    if (statedMonthlyIncome <= 2000) {
      return {
        weight: 0.3,
        score: 40,
        note: "Income appears broadly consistent, but the supporting pay stub is weak.",
      };
    }

    return {
      weight: 0.3,
      score: 0,
      note: "The provided pay stub does not support the stated monthly income.",
    };
  })();

  const incomeLevel = (() => {
    if (ratio >= 3) {
      return {
        weight: 0.25,
        score: 90,
        note: `Verified income is ${ratio.toFixed(1)}x the requested loan amount.`,
      };
    }

    if (ratio >= 1) {
      return {
        weight: 0.25,
        score: 45,
        note: `Verified income is ${ratio.toFixed(1)}x the requested loan amount, below ideal coverage.`,
      };
    }

    return {
      weight: 0.25,
      score: 0,
      note: `Verified income is ${ratio.toFixed(1)}x the requested loan amount, below the current threshold.`,
    };
  })();

  const accountStability = (() => {
    if (hasHealthyBankStatement) {
      return {
        weight: 0.2,
        score: 85,
        note: "Bank activity appears stable with steady deposits and no major balance concerns.",
      };
    }

    if (hasRiskyBankStatement) {
      return {
        weight: 0.2,
        score: 15,
        note: "Bank activity suggests balance pressure or irregular cash flow.",
      };
    }

    return {
      weight: 0.2,
      score: 0,
      note: "No bank statement was provided for account stability review.",
    };
  })();

  const employmentFactor = {
    weight: 0.15,
    score: employmentStatus === "employed" ? 100 : 60,
    note:
      employmentStatus === "employed"
        ? "Applicant reports steady employment."
        : "Applicant reports self-employed income.",
  };

  const debtToIncome = (() => {
    if (hasRiskyBankStatement) {
      return {
        weight: 0.1,
        score: 80,
        note: "Withdrawal activity suggests elevated existing obligations.",
      };
    }

    if (hasHealthyBankStatement) {
      return {
        weight: 0.1,
        score: 30,
        note: "Account activity appears manageable, though this factor carries limited weight in the current model.",
      };
    }

    return {
      weight: 0.1,
      score: 0,
      note: "Cannot assess obligations without account history.",
    };
  })();

  return {
    incomeVerification,
    incomeLevel,
    accountStability,
    employmentStatus: employmentFactor,
    debtToIncome,
  };
}

export function buildMockApplication({
  applicant,
  documents,
  email,
  employmentStatus,
  id = "custom",
  loanAmount,
  statedMonthlyIncome,
}: MockApplicationInput): Application {
  const normalizedDocuments = normalizeDocuments(documents);
  const normalizedLoanAmount = roundCurrency(loanAmount);
  const normalizedMonthlyIncome = roundCurrency(statedMonthlyIncome);
  const normalizedApplicant = applicant.trim() || "New applicant";
  const normalizedEmail = email.trim() || "applicant@example.com";
  const extractionError =
    normalizedDocuments.length === 0 ? "no_documents_provided" : undefined;

  const breakdown = buildScoreBreakdown(
    normalizedMonthlyIncome,
    normalizedLoanAmount,
    employmentStatus,
    normalizedDocuments,
  );

  const weightedScore = Math.round(
    breakdown.incomeVerification.weight * breakdown.incomeVerification.score +
      breakdown.incomeLevel.weight * breakdown.incomeLevel.score +
      breakdown.accountStability.weight * breakdown.accountStability.score +
      breakdown.employmentStatus.weight * breakdown.employmentStatus.score +
      breakdown.debtToIncome.weight * breakdown.debtToIncome.score,
  );

  const score = extractionError ? 55 : weightedScore;
  const decision =
    extractionError || score >= 50
      ? score >= 75
        ? "approved"
        : "flagged_for_review"
      : "denied";

  return {
    id,
    applicant: normalizedApplicant,
    email: normalizedEmail,
    loanAmount: normalizedLoanAmount,
    statedMonthlyIncome: normalizedMonthlyIncome,
    employmentStatus,
    documents: normalizedDocuments,
    score,
    decision,
    extractionError,
    breakdown,
  };
}

export function buildCustomApplicationSearchParams(
  input: MockApplicationInput,
) {
  const params = new URLSearchParams({
    applicant: input.applicant.trim() || "New applicant",
    documents: normalizeDocuments(input.documents).join(","),
    email: input.email.trim() || "applicant@example.com",
    employmentStatus: input.employmentStatus,
    loanAmount: String(roundCurrency(input.loanAmount)),
    source: "custom",
    statedMonthlyIncome: String(roundCurrency(input.statedMonthlyIncome)),
  });

  return params.toString();
}

export function getApplicationRoute(
  application: Application,
  options?: {
    custom?: boolean;
    search?: string;
  },
) {
  const isCustom = options?.custom ?? false;
  const search = options?.search ? `?${options.search}` : "";

  if (application.extractionError === "no_documents_provided") {
    const customRoute = isCustom
      ? `/decision/review/${application.id}`
      : `/reupload/${application.id}`;

    return `${customRoute}${search}`;
  }

  if (application.decision === "approved") {
    return `/decision/approved/${application.id}${search}`;
  }

  if (application.decision === "denied") {
    return `/decision/denied/${application.id}${search}`;
  }

  return `/decision/review/${application.id}${search}`;
}

export function getCustomApplicationFromSearchParams(
  searchParams: RouteSearchParams,
  id = "custom",
) {
  if (readString(searchParams.source) !== "custom") {
    return undefined;
  }

  const employmentStatus = readString(searchParams.employmentStatus);
  const applicant = readString(searchParams.applicant);
  const email = readString(searchParams.email);
  const loanAmount = Number(readString(searchParams.loanAmount));
  const statedMonthlyIncome = Number(readString(searchParams.statedMonthlyIncome));
  const documentsValue = readString(searchParams.documents) ?? "";

  if (
    !applicant ||
    !email ||
    employmentStatus !== "employed" &&
      employmentStatus !== "self-employed" ||
    Number.isNaN(loanAmount) ||
    Number.isNaN(statedMonthlyIncome)
  ) {
    return undefined;
  }

  return buildMockApplication({
    applicant,
    documents: documentsValue ? documentsValue.split(",") : [],
    email,
    employmentStatus,
    id,
    loanAmount,
    statedMonthlyIncome,
  });
}
