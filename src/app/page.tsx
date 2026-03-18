"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { applications } from "@/data/applications";
import {
  buildCustomApplicationSearchParams,
  buildMockApplication,
  getApplicationRoute,
} from "@/lib/mockDecision";
import type { EmploymentStatus } from "@/types/application";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const demoScenarios = [
  {
    id: "app-001",
    title: "Approved",
    description: "Strong income verification and healthy account history.",
  },
  {
    id: "app-002",
    title: "Denied",
    description: "Low income coverage and unstable cash flow.",
  },
  {
    id: "app-003",
    title: "Manual review",
    description: "Mixed signals that need a human review decision.",
  },
  {
    id: "app-005",
    title: "Missing documents",
    description: "No supporting documents submitted with the application.",
  },
] as const;

const documentOptions = [
  {
    fileName: "pay_stub_strong.pdf",
    label: "Recent pay stub",
    description: "Best for employed applicants with consistent pay.",
  },
  {
    fileName: "bank_statement_healthy.pdf",
    label: "Healthy bank statement",
    description: "Shows stable balances and regular deposits.",
  },
  {
    fileName: "pay_stub_weak.pdf",
    label: "Limited income record",
    description: "Represents lower confidence income verification.",
  },
  {
    fileName: "bank_statement_risky.pdf",
    label: "Risky bank statement",
    description: "Represents irregular deposits and balance pressure.",
  },
  {
    fileName: "government_id.pdf",
    label: "Government ID",
    description: "Optional extra document for the mock uploader.",
  },
] as const;

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getScenarioApplication(id: string) {
  return applications.find((application) => application.id === id);
}

function haveSameDocuments(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();

  return leftSorted.every((document, index) => document === rightSorted[index]);
}

export default function Page() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialApplication = getScenarioApplication("app-001");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    initialApplication?.id ?? "app-001",
  );
  const [applicantName, setApplicantName] = useState(
    initialApplication?.applicant ?? "",
  );
  const [email, setEmail] = useState(initialApplication?.email ?? "");
  const [loanAmount, setLoanAmount] = useState(
    String(initialApplication?.loanAmount ?? ""),
  );
  const [monthlyIncome, setMonthlyIncome] = useState(
    String(initialApplication?.statedMonthlyIncome ?? ""),
  );
  const [employmentStatus, setEmploymentStatus] =
    useState<EmploymentStatus>(initialApplication?.employmentStatus ?? "employed");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    initialApplication?.documents ?? [],
  );

  const selectedScenario =
    demoScenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    demoScenarios[0];
  const seededApplication = getScenarioApplication(selectedScenario.id);

  function applyScenario(applicationId: string) {
    const application = getScenarioApplication(applicationId);

    if (!application) {
      return;
    }

    setSelectedScenarioId(application.id);
    setApplicantName(application.applicant);
    setEmail(application.email);
    setLoanAmount(String(application.loanAmount));
    setMonthlyIncome(String(application.statedMonthlyIncome));
    setEmploymentStatus(application.employmentStatus);
    setSelectedDocuments([...application.documents]);
  }

  function toggleDocument(fileName: string) {
    setSelectedDocuments((currentDocuments) => {
      if (currentDocuments.includes(fileName)) {
        return currentDocuments.filter((document) => document !== fileName);
      }

      return [...currentDocuments, fileName];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!seededApplication) {
      return;
    }

    const usesSeededScenario =
      applicantName.trim() === seededApplication.applicant &&
      email.trim() === seededApplication.email &&
      Number(loanAmount || 0) === seededApplication.loanAmount &&
      Number(monthlyIncome || 0) === seededApplication.statedMonthlyIncome &&
      employmentStatus === seededApplication.employmentStatus &&
      haveSameDocuments(selectedDocuments, seededApplication.documents);

    if (usesSeededScenario) {
      startTransition(() => {
        router.push(getApplicationRoute(seededApplication));
      });

      return;
    }

    const customApplication = buildMockApplication({
      applicant: applicantName,
      documents: selectedDocuments,
      email,
      employmentStatus,
      id: "custom",
      loanAmount: Number(loanAmount || 0),
      statedMonthlyIncome: Number(monthlyIncome || 0),
    });
    const customSearch = buildCustomApplicationSearchParams({
      applicant: applicantName,
      documents: selectedDocuments,
      email,
      employmentStatus,
      loanAmount: Number(loanAmount || 0),
      statedMonthlyIncome: Number(monthlyIncome || 0),
    });

    startTransition(() => {
      router.push(
        getApplicationRoute(customApplication, {
          custom: true,
          search: customSearch,
        }),
      );
    });
  }

  if (!seededApplication) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf4f1] px-6 py-16">
        <div className="w-full max-w-lg rounded-[36px] bg-white p-10 text-center shadow-[0_1px_0_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Scenario unavailable
          </h1>
          <p className="mt-4 text-base leading-7 text-[#6f6a67]">
            The selected demo scenario could not be found in the mock dataset.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf4f1] px-0 py-0 text-[#0c0c0c] sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-[980px] rounded-none bg-white px-5 py-8 shadow-[0_1px_0_rgba(15,23,42,0.05)] sm:rounded-[40px] sm:px-10 sm:py-12 lg:px-12">
        <header className="mx-auto max-w-[840px]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1d6ff2]">
            Bree Loan Demo
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[#050505] sm:text-6xl">
            Loan Application
          </h1>
          <p className="mt-5 text-base leading-8 text-[#6f6a67] sm:text-lg">
            Use a seeded scenario to preview each loan decision state with a
            clean, production-style frontend flow.
          </p>
        </header>

        <form className="mx-auto mt-10 max-w-[840px]" onSubmit={handleSubmit}>
          <section className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1d6ff2]">
                Demo: Preseeded data
              </p>
              <h2 className="text-2xl font-semibold text-[#050505] sm:text-3xl">
                Load one of the sample applications
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[#6f6a67]">
                Use these four demo paths to jump into the prepared applicant
                outcomes. If you edit the form afterward, we will generate a
                fresh mock decision from your custom inputs.
              </p>
            </div>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
              {demoScenarios.map((scenario) => {
                const isActive = scenario.id === selectedScenarioId;

                return (
                  <button
                    key={scenario.id}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-[#1d6ff2] bg-white text-[#1d6ff2]"
                        : "border-[#e7dfd8] bg-white text-[#5f5a57] hover:border-[#cfdffc] hover:text-[#1d6ff2]"
                    }`}
                    onClick={() => applyScenario(scenario.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.14em]">
                      {scenario.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                      {scenario.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pt-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                Step 1
              </p>
              <h2 className="text-2xl font-semibold text-[#050505] sm:text-3xl">
                Applicant details
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[#6f6a67]">
                Review the current application details below, or enter your own
                custom information to generate a fresh mock decision.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#8a847f]">
                  Applicant name
                </span>
                <input
                  className="mt-3 w-full rounded-[20px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base text-[#050505] outline-none transition focus:border-[#1d6ff2]"
                  onChange={(event) => setApplicantName(event.target.value)}
                  type="text"
                  value={applicantName}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#8a847f]">Email</span>
                <input
                  className="mt-3 w-full rounded-[20px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base text-[#050505] outline-none transition focus:border-[#1d6ff2]"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#8a847f]">
                  Loan amount
                </span>
                <input
                  className="mt-3 w-full rounded-[20px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base text-[#050505] outline-none transition focus:border-[#1d6ff2]"
                  min="0"
                  onChange={(event) => setLoanAmount(event.target.value)}
                  type="number"
                  value={loanAmount}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#8a847f]">
                  Monthly income
                </span>
                <input
                  className="mt-3 w-full rounded-[20px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base text-[#050505] outline-none transition focus:border-[#1d6ff2]"
                  min="0"
                  onChange={(event) => setMonthlyIncome(event.target.value)}
                  type="number"
                  value={monthlyIncome}
                />
              </label>
            </div>
          </section>

          <section className="mt-12 pt-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                  Step 2
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#050505] sm:text-3xl">
                  Employment and documents
                </h3>
              </div>
              <p className="text-sm text-[#6f6a67]">
                {selectedDocuments.length} file
                {selectedDocuments.length === 1 ? "" : "s"} selected
              </p>
            </div>

            <div className="mt-8">
              <label className="block">
                <span className="text-sm font-medium text-[#8a847f]">
                  Employment status
                </span>
                <select
                  className="mt-3 w-full rounded-[20px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base text-[#050505] outline-none transition focus:border-[#1d6ff2]"
                  onChange={(event) =>
                    setEmploymentStatus(event.target.value as EmploymentStatus)
                  }
                  value={employmentStatus}
                >
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-employed</option>
                </select>
              </label>
            </div>

            <div className="mt-8 rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                Document upload
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6f6a67]">
                No real files are uploaded in this prototype. Select the
                document set you want to include in the seeded demo flow.
              </p>
            </div>

            <div className="mt-6 divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
              {documentOptions.map((document) => {
                const isSelected = selectedDocuments.includes(
                  document.fileName,
                );

                return (
                  <button
                    key={document.fileName}
                    className="grid w-full gap-4 py-5 text-left transition hover:bg-[#fbf8f5] sm:grid-cols-[1fr_auto]"
                    onClick={() => toggleDocument(document.fileName)}
                    type="button"
                  >
                    <div>
                      <p className="text-lg font-medium text-[#050505]">
                        {document.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                        {document.description}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9d9791]">
                        {document.fileName}
                      </p>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                          isSelected
                            ? "bg-[#1d6ff2] text-white"
                            : "bg-[#efebe7] text-[#6f6a67]"
                        }`}
                      >
                        {isSelected ? "Selected" : "Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-center gap-5 pt-4">
              <p className="max-w-2xl text-center text-base leading-7 text-[#6f6a67]">
                Submit routes this mock application to the prepared outcome page
                for the selected scenario.
              </p>
              <button
                className="inline-flex min-w-[280px] items-center justify-center rounded-[20px] border-2 border-black bg-[#1d6ff2] px-8 py-4 text-xl font-medium text-white shadow-[10px_10px_0_#050505] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[8px_8px_0_#050505] disabled:translate-x-0 disabled:translate-y-0 disabled:border-[#9bbef9] disabled:bg-[#9bbef9] disabled:shadow-none"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Routing..." : "Submit application"}
              </button>
            </div>
          </section>
        </form>

        <section className="mx-auto mt-12 max-w-[840px] border-t border-[#ece6e1] pt-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                Application snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#050505] sm:text-3xl">
                Current applicant info
              </h2>
            </div>
            <div className="hidden h-[3px] w-32 bg-[#1d6ff2] sm:block" />
          </div>

          <div className="mt-8 divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">Applicant</p>
              <p className="text-2xl font-medium text-[#050505]">
                {applicantName}
              </p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">Email</p>
              <p className="text-2xl font-medium text-[#050505]">{email}</p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">Loan amount</p>
              <p className="text-2xl font-medium text-[#050505]">
                {formatCurrency(Number(loanAmount || 0))}
              </p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">
                Monthly income
              </p>
              <p className="text-2xl font-medium text-[#050505]">
                {formatCurrency(Number(monthlyIncome || 0))}
              </p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">
                Employment status
              </p>
              <p className="text-2xl font-medium capitalize text-[#050505]">
                {employmentStatus}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
