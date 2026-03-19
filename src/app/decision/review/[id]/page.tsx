import Link from "next/link";

import {
  DecisionPageFrame,
  getDecisionButtonClasses,
} from "@/components/decision-page-frame";
import { StatusTracker } from "@/components/status-tracker";
import { getApplicationById } from "@/lib/getApplicationById";
import {
  buildSearchStringFromRouteSearchParams,
  getCustomApplicationFromSearchParams,
} from "@/lib/mockDecision";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getDocumentsLabel(documents: string[]) {
  if (documents.length === 0) {
    return "No files received";
  }

  if (documents.length === 1) {
    return "1 file received";
  }

  return `${documents.length} files received`;
}

type ReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({
  params,
  searchParams,
}: ReviewPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const preservedSearch = buildSearchStringFromRouteSearchParams(
    resolvedSearchParams,
  );
  const application =
    getApplicationById(id) ??
    getCustomApplicationFromSearchParams(resolvedSearchParams, id);

  if (!application) {
    return (
      <DecisionPageFrame
        actions={
          <Link className={getDecisionButtonClasses("primary")} href="/">
            Return home
          </Link>
        }
        description="We could not find an application with that ID. Please return to the home screen and choose a valid demo scenario."
        eyebrow="Application update"
        title="Application not found"
      >
        <section className="border-t border-[#ece6e1] pt-10">
          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Requested path
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              /decision/review/{id}
            </p>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  if (application.extractionError === "no_documents_provided") {
    return (
      <DecisionPageFrame
        actions={
          <>
            <Link
              className={getDecisionButtonClasses("primary")}
              href={`/reupload/${application.id}${preservedSearch}`}
            >
              Upload documents
            </Link>
            <Link className={getDecisionButtonClasses("secondary")} href="/">
              Return home
            </Link>
          </>
        }
        description="This application is waiting on supporting documents before a reviewer can continue. The fastest path forward is to upload the missing files."
        eyebrow="Action needed"
        title="We need your documents before review can begin"
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
              <p className="text-2xl font-medium text-[#98928d]">Status</p>
              <p className="text-2xl font-medium text-[#050505]">
                Awaiting document upload
              </p>
            </div>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  if (application.decision !== "flagged_for_review") {
    return (
      <DecisionPageFrame
        actions={
          <Link className={getDecisionButtonClasses("primary")} href="/">
            Choose another scenario
          </Link>
        }
        description="This application exists, but it is not currently in a manual review state. Use the scenario selector to open the matching experience."
        eyebrow="Application update"
        title="This page does not match the application status"
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
              <p className="text-2xl font-medium text-[#98928d]">Current status</p>
              <p className="text-2xl font-medium capitalize text-[#050505]">
                {application.decision.replaceAll("_", " ")}
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
        <Link className={getDecisionButtonClasses("primary")} href="/">
          Return home
        </Link>
      }
      description={`Thanks, ${application.applicant}. We received your application and supporting documents. A reviewer is taking a final look before we make a decision, and we’ll email ${application.email} as soon as the review is complete.`}
      eyebrow="Under review"
      title="Your application is under review"
    >
      <StatusTracker
        steps={[
          {
            label: "Submitted",
            detail: "Your application and documents have been received.",
            state: "complete",
          },
          {
            label: "Automated review",
            detail: "Our system completed its initial assessment.",
            state: "complete",
          },
          {
            label: "Manual review",
            detail: "A specialist is finalizing the decision.",
            state: "current",
          },
        ]}
      />

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Expected timeline
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#050505]">
              Within 1 business day
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              Most flagged applications are resolved the same day, but we set a
              wider expectation to avoid overpromising.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              What to expect
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              No action is needed right now.
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              We will contact you only if the reviewer needs anything else. If
              everything checks out, you will move directly to a final decision.
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
              Review in progress
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
            <p className="text-2xl font-medium text-[#98928d]">Documents</p>
            <p className="text-2xl font-medium text-[#050505]">
              {getDocumentsLabel(application.documents)}
            </p>
          </div>
        </div>
      </section>
    </DecisionPageFrame>
  );
}
