import type { Application } from "@/types/application";

export const applications: Application[] = [
  {
    id: "app-001",
    applicant: "Jane Doe",
    email: "jane.doe@example.com",
    loanAmount: 1500,
    statedMonthlyIncome: 5000,
    employmentStatus: "employed",
    documents: ["pay_stub_strong.pdf", "bank_statement_healthy.pdf"],
    score: 82,
    decision: "approved",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 95,
        note: "Documented income matches stated income within tolerance",
      },
      incomeLevel: {
        weight: 0.25,
        score: 90,
        note: "Monthly income is 3.3x loan amount",
      },
      accountStability: {
        weight: 0.2,
        score: 85,
        note: "Positive balance, no overdrafts, consistent deposits",
      },
      employmentStatus: {
        weight: 0.15,
        score: 100,
        note: "Employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 30,
        note: "Low withdrawal-to-deposit ratio",
      },
    },
  },
  {
    id: "app-002",
    applicant: "Bob Smith",
    email: "bob.smith@example.com",
    loanAmount: 2000,
    statedMonthlyIncome: 1400,
    employmentStatus: "self-employed",
    documents: ["pay_stub_weak.pdf", "bank_statement_risky.pdf"],
    score: 31,
    decision: "denied",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 40,
        note: "Documented income roughly matches but low confidence",
      },
      incomeLevel: {
        weight: 0.25,
        score: 0,
        note: "Monthly income is 0.7x loan amount, below the 3x threshold",
      },
      accountStability: {
        weight: 0.2,
        score: 15,
        note: "Overdrafts present, inconsistent deposits, low balance",
      },
      employmentStatus: {
        weight: 0.15,
        score: 60,
        note: "Self-employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 80,
        note: "High withdrawal-to-deposit ratio",
      },
    },
  },
  {
    id: "app-003",
    applicant: "Bob Smith",
    email: "bob.smith@example.com",
    loanAmount: 300,
    statedMonthlyIncome: 1400,
    employmentStatus: "self-employed",
    documents: ["pay_stub_weak.pdf", "bank_statement_risky.pdf"],
    score: 58,
    decision: "flagged_for_review",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 40,
        note: "Documented income roughly matches but low confidence",
      },
      incomeLevel: {
        weight: 0.25,
        score: 90,
        note: "Monthly income is 4.7x loan amount",
      },
      accountStability: {
        weight: 0.2,
        score: 15,
        note: "Overdrafts present, inconsistent deposits, low balance",
      },
      employmentStatus: {
        weight: 0.15,
        score: 60,
        note: "Self-employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 80,
        note: "High withdrawal-to-deposit ratio",
      },
    },
  },
  {
    id: "app-004",
    applicant: "Jane Doe",
    email: "jane.doe@example.com",
    loanAmount: 4500,
    statedMonthlyIncome: 5000,
    employmentStatus: "employed",
    documents: ["pay_stub_strong.pdf", "bank_statement_healthy.pdf"],
    score: 68,
    decision: "flagged_for_review",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 95,
        note: "Documented income matches stated income within tolerance",
      },
      incomeLevel: {
        weight: 0.25,
        score: 45,
        note: "Monthly income is 1.1x loan amount, below the 3x threshold",
      },
      accountStability: {
        weight: 0.2,
        score: 85,
        note: "Positive balance, no overdrafts, consistent deposits",
      },
      employmentStatus: {
        weight: 0.15,
        score: 100,
        note: "Employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 30,
        note: "Low withdrawal-to-deposit ratio",
      },
    },
  },
  {
    id: "app-005",
    applicant: "Carol Tester",
    email: "carol.tester@example.com",
    loanAmount: 1000,
    statedMonthlyIncome: 8000,
    employmentStatus: "employed",
    documents: [],
    score: 55,
    decision: "flagged_for_review",
    extractionError: "no_documents_provided",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 0,
        note: "No documents to verify",
      },
      incomeLevel: {
        weight: 0.25,
        score: 95,
        note: "Stated income is 8x loan amount, unverified",
      },
      accountStability: {
        weight: 0.2,
        score: 0,
        note: "No bank statement provided",
      },
      employmentStatus: {
        weight: 0.15,
        score: 100,
        note: "Employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 0,
        note: "Cannot assess without bank statement",
      },
    },
  },
  {
    id: "app-006",
    applicant: "Dave Liar",
    email: "dave.liar@example.com",
    loanAmount: 2000,
    statedMonthlyIncome: 10000,
    employmentStatus: "employed",
    documents: ["pay_stub_weak.pdf"],
    score: 28,
    decision: "denied",
    breakdown: {
      incomeVerification: {
        weight: 0.3,
        score: 0,
        note: "Mismatch between stated $10,000/mo and documented $1,400/mo",
      },
      incomeLevel: {
        weight: 0.25,
        score: 0,
        note: "Documented income is 0.7x loan amount",
      },
      accountStability: {
        weight: 0.2,
        score: 15,
        note: "Overdrafts present, inconsistent deposits",
      },
      employmentStatus: {
        weight: 0.15,
        score: 100,
        note: "Employed",
      },
      debtToIncome: {
        weight: 0.1,
        score: 80,
        note: "High withdrawal-to-deposit ratio",
      },
    },
  },
];
