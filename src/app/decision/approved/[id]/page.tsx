import Link from "next/link";

import {
  DecisionPageFrame,
  getDecisionButtonClasses,
} from "@/components/decision-page-frame";
import { StatusTracker } from "@/components/status-tracker";
import { getApplicationById } from "@/lib/getApplicationById";
import { getCustomApplicationFromSearchParams } from "@/lib/mockDecision";

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
    return "No files on record";
  }

  if (documents.length === 1) {
    return "1 file received";
  }

  return `${documents.length} files received`;
}

type ApprovedPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({
  params,
  searchParams,
}: ApprovedPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
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
              /decision/approved/{id}
            </p>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  if (application.decision !== "approved") {
    return (
      <DecisionPageFrame
        actions={
          <Link className={getDecisionButtonClasses("primary")} href="/">
            Choose another scenario
          </Link>
        }
        description="This application exists, but it is not currently in an approved state. Use the scenario selector to open the matching experience."
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
          Start a new application
        </Link>
      }
      description={`Good news, ${application.applicant}. We reviewed your application and can move forward with your loan request. Your next step is to review the final offer details we send to ${application.email}.`}
      eyebrow="Decision ready"
      title="Your application is approved"
    >
      <StatusTracker
        steps={[
          {
            label: "Submitted",
            detail: "We received your application and supporting documents.",
            state: "complete",
          },
          {
            label: "Automated review",
            detail: "Your application met the criteria for an instant decision.",
            state: "complete",
          },
          {
            label: "Approved",
            detail: "Your offer is ready for the next step.",
            state: "current",
          },
        ]}
      />

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-[#dcebdd] bg-[#f4fbf5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#56755a]">
              Approved amount
            </p>
            <p className="mt-3 text-4xl font-semibold text-[#050505]">
              {formatCurrency(application.loanAmount)}
            </p>
            <p className="mt-3 text-base leading-7 text-[#5c6c5f]">
              This prototype assumes the requested amount is the approved offer.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              What happens next
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              Review your terms and confirm payout details.
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              In a production flow, this is where we would show the final offer
              summary and let the applicant accept the agreement.
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
              Ready to move forward
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
