"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  DecisionPageFrame,
  getDecisionButtonClasses,
} from "@/components/decision-page-frame";
import { StatusTracker } from "@/components/status-tracker";
import { getApplicationById } from "@/lib/getApplicationById";
import {
  buildCustomApplicationSearchParams,
  buildMockApplication,
  getCustomApplicationFromSearchParams,
  getApplicationRoute,
  type RouteSearchParams,
} from "@/lib/mockDecision";

const documentOptions = [
  {
    fileName: "pay_stub_strong.pdf",
    label: "Recent pay stub",
    description: "Strong income verification with recent employer-issued details.",
  },
  {
    fileName: "bank_statement_healthy.pdf",
    label: "Healthy bank statement",
    description: "Shows consistent deposits and stable balances.",
  },
  {
    fileName: "pay_stub_weak.pdf",
    label: "Limited income record",
    description: "Lower-confidence proof of income that may still require review.",
  },
  {
    fileName: "bank_statement_risky.pdf",
    label: "Risky bank statement",
    description: "Included for demo purposes to show a weaker resubmission path.",
  },
  {
    fileName: "government_id.pdf",
    label: "Government ID",
    description: "Optional identity document for the mock uploader.",
  },
] as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getRouteSearchParams(searchParams: URLSearchParams): RouteSearchParams {
  const routeSearchParams: RouteSearchParams = {};

  searchParams.forEach((value, key) => {
    const currentValue = routeSearchParams[key];

    if (currentValue === undefined) {
      routeSearchParams[key] = value;
      return;
    }

    if (Array.isArray(currentValue)) {
      routeSearchParams[key] = [...currentValue, value];
      return;
    }

    routeSearchParams[key] = [currentValue, value];
  });

  return routeSearchParams;
}

function getPreviewCopy(documentCount: number, decision: string) {
  if (documentCount === 0) {
    return {
      detail:
        "Select at least one supporting document before resubmitting the application.",
      title: "Still missing documents",
      tone: "warning",
    } as const;
  }

  if (decision === "approved") {
    return {
      detail:
        "This document set is strong enough to move the application directly to an approved state in the mock scoring flow.",
      title: "Likely approved after resubmission",
      tone: "approved",
    } as const;
  }

  return {
    detail:
      "This document set should restart the application and send it into manual review for a final decision.",
    title: "Likely manual review after resubmission",
    tone: "review",
  } as const;
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const routeSearchParams = getRouteSearchParams(new URLSearchParams(searchParams));
  const currentSearch = searchParams.toString();
  const preservedSearch = currentSearch ? `?${currentSearch}` : "";
  const id = params.id;
  const application =
    getApplicationById(id) ?? getCustomApplicationFromSearchParams(routeSearchParams, id);

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    application?.documents ?? [],
  );

  if (!application) {
    return (
      <DecisionPageFrame
        actions={
          <Link className={getDecisionButtonClasses("primary")} href="/">
            Return home
          </Link>
        }
        description="We could not find an application that matches this upload request. Please return home and choose a valid demo path."
        eyebrow="Document upload"
        title="Application not found"
      >
        <section className="border-t border-[#ece6e1] pt-10">
          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Requested path
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              /reupload/{id}
            </p>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  const previewApplication = buildMockApplication({
    applicant: application.applicant,
    documents: selectedDocuments,
    email: application.email,
    employmentStatus: application.employmentStatus,
    id: `${application.id}-preview`,
    loanAmount: application.loanAmount,
    statedMonthlyIncome: application.statedMonthlyIncome,
  });
  const preview = getPreviewCopy(
    selectedDocuments.length,
    previewApplication.decision,
  );

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

    if (selectedDocuments.length === 0) {
      return;
    }

    const resubmittedId = `${application.id}-resubmitted`;
    const resubmittedApplication = buildMockApplication({
      applicant: application.applicant,
      documents: selectedDocuments,
      email: application.email,
      employmentStatus: application.employmentStatus,
      id: resubmittedId,
      loanAmount: application.loanAmount,
      statedMonthlyIncome: application.statedMonthlyIncome,
    });
    const search = buildCustomApplicationSearchParams({
      applicant: application.applicant,
      documents: selectedDocuments,
      email: application.email,
      employmentStatus: application.employmentStatus,
      loanAmount: application.loanAmount,
      statedMonthlyIncome: application.statedMonthlyIncome,
    });

    startTransition(() => {
      router.push(
        getApplicationRoute(resubmittedApplication, {
          custom: true,
          search,
        }),
      );
    });
  }

  if (application.extractionError !== "no_documents_provided") {
    return (
      <DecisionPageFrame
        actions={
          <>
            <Link
              className={getDecisionButtonClasses("primary")}
              href={`/decision/review/${application.id}${preservedSearch}`}
            >
              View application status
            </Link>
            <Link className={getDecisionButtonClasses("secondary")} href="/">
              Return home
            </Link>
          </>
        }
        description="This application does not currently have a missing-documents hold. No re-upload is needed right now."
        eyebrow="Document upload"
        title="No additional documents requested"
      >
        <section className="border-t border-[#ece6e1] pt-10">
          <div className="divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">Applicant</p>
              <p className="text-2xl font-medium text-[#050505]">
                {application.applicant}
              </p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
              <p className="text-2xl font-medium text-[#98928d]">Documents on file</p>
              <p className="text-2xl font-medium text-[#050505]">
                {application.documents.length}
              </p>
            </div>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  return (
    <DecisionPageFrame
      actions={
        <>
          <Link
            className={getDecisionButtonClasses("primary")}
            href={`/decision/review/${application.id}${preservedSearch}`}
          >
            Back to status
          </Link>
          <Link className={getDecisionButtonClasses("secondary")} href="/">
            Return home
          </Link>
        </>
      }
      description={`Thanks, ${application.applicant}. We could not start the final review because no supporting documents were attached to the application. Add documents below and we will restart the decision flow without making you begin from scratch.`}
      eyebrow="Document upload"
      title="Upload your missing documents"
    >
      <StatusTracker
        steps={[
          {
            label: "Submitted",
            detail: "Your application details were received successfully.",
            state: "complete",
          },
          {
            label: "Documents requested",
            detail: "We need supporting files before final review can begin.",
            state: "current",
          },
          {
            label: "Review resumes",
            detail: "Once documents are added, the application continues automatically.",
            state: "upcoming",
          },
        ]}
      />

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Application on hold
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#050505]">
              Missing income and banking documents
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              The reviewer cannot verify the application until at least one
              supporting document is attached. For the strongest mock outcome,
              upload both a pay stub and a bank statement.
            </p>
          </div>

          <div
            className={`rounded-[28px] border px-6 py-6 ${
              preview.tone === "approved"
                ? "border-[#dcebdd] bg-[#f4fbf5]"
                : preview.tone === "review"
                  ? "border-[#ece6e1] bg-[#fbf8f5]"
                  : "border-[#f0dfd7] bg-[#fff7f2]"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Resubmission preview
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#050505]">
              {preview.title}
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              {preview.detail}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
              Application summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#050505] sm:text-3xl">
              Ready for a quick document fix
            </h2>
          </div>
        </div>

        <div className="mt-8 divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
          <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
            <p className="text-2xl font-medium text-[#98928d]">Applicant</p>
            <p className="text-2xl font-medium text-[#050505]">
              {application.applicant}
            </p>
          </div>
          <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
            <p className="text-2xl font-medium text-[#98928d]">Requested amount</p>
            <p className="text-2xl font-medium text-[#050505]">
              {formatCurrency(application.loanAmount)}
            </p>
          </div>
          <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
            <p className="text-2xl font-medium text-[#98928d]">Monthly income</p>
            <p className="text-2xl font-medium text-[#050505]">
              {formatCurrency(application.statedMonthlyIncome)}
            </p>
          </div>
          <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
            <p className="text-2xl font-medium text-[#98928d]">Documents on file</p>
            <p className="text-2xl font-medium text-[#050505]">
              {application.documents.length === 0
                ? "No files currently attached"
                : `${application.documents.length} attached`}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
              Upload documents
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#050505] sm:text-3xl">
              Select the files to resubmit
            </h2>
          </div>
          <p className="hidden text-sm text-[#6f6a67] sm:block">
            Mock uploader only. No backend storage.
          </p>
        </div>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            {documentOptions.map((document) => {
              const isSelected = selectedDocuments.includes(document.fileName);

              return (
                <label
                  className={`cursor-pointer rounded-[24px] border px-5 py-5 transition ${
                    isSelected
                      ? "border-[#050505] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                      : "border-[#ece6e1] bg-[#fbf8f5] hover:border-[#d7d0ca]"
                  }`}
                  key={document.fileName}
                >
                  <div className="flex items-start gap-4">
                    <input
                      checked={isSelected}
                      className="mt-1 h-5 w-5 rounded border-[#d7d0ca] accent-[#050505] focus:ring-[#050505]"
                      onChange={() => toggleDocument(document.fileName)}
                      type="checkbox"
                    />
                    <div>
                      <p className="text-lg font-semibold text-[#050505]">
                        {document.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                        {document.description}
                      </p>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8a847f]">
                        {document.fileName}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-[#ece6e1] bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                Selected files
              </p>
              <p className="mt-2 text-xl font-semibold text-[#050505]">
                {selectedDocuments.length === 0
                  ? "No files selected yet"
                  : `${selectedDocuments.length} file${
                      selectedDocuments.length === 1 ? "" : "s"
                    } ready to resubmit`}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                After resubmission, this prototype routes straight into the
                next likely decision state.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-[18px] border-2 border-black bg-[#1d6ff2] px-6 py-3 text-base font-medium text-white shadow-[8px_8px_0_#050505] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0_#050505] disabled:cursor-not-allowed disabled:border-[#d3d3d3] disabled:bg-[#b9cdf7] disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              disabled={isPending || selectedDocuments.length === 0}
              type="submit"
            >
              {isPending ? "Resubmitting..." : "Resubmit documents"}
            </button>
          </div>
        </form>
      </section>
    </DecisionPageFrame>
  );
}
