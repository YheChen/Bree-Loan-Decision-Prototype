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

type DeniedPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({
  params,
  searchParams,
}: DeniedPageProps) {
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
              /decision/denied/{id}
            </p>
          </div>
        </section>
      </DecisionPageFrame>
    );
  }

  if (application.decision !== "denied") {
    return (
      <DecisionPageFrame
        actions={
          <Link className={getDecisionButtonClasses("primary")} href="/">
            Choose another scenario
          </Link>
        }
        description="This application exists, but it is not currently in a denied state. Use the scenario selector to open the matching experience."
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
      description={`We’re sorry, ${application.applicant}. We’re unable to approve this application right now. We’ll send a follow-up email to ${application.email} with the formal notice and information about next steps available to you.`}
      eyebrow="Decision ready"
      title="We’re unable to approve this application right now"
    >
      <StatusTracker
        steps={[
          {
            label: "Submitted",
            detail: "We received your application and supporting documents.",
            state: "complete",
          },
          {
            label: "Reviewed",
            detail: "Your application completed the decision process.",
            state: "complete",
          },
          {
            label: "Decision sent",
            detail: "Your outcome is now available.",
            state: "complete",
          },
        ]}
      />

      <section className="border-t border-[#ece6e1] pt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              What happens next
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              Check your email for the formal notice and next-step guidance.
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              We intentionally keep this screen high level. Detailed denial
              factors and numerical scores are not shown here.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#ece6e1] bg-white px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
              Support options
            </p>
            <p className="mt-3 text-xl font-medium text-[#050505]">
              Need to correct or update information?
            </p>
            <p className="mt-3 text-base leading-7 text-[#6f6a67]">
              If any submitted information is outdated, use the support contact
              in your follow-up email so the team can guide you on the next
              appropriate step.
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
              Shared for confirmation only
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
            <p className="text-2xl font-medium text-[#98928d]">Contact email</p>
            <p className="text-2xl font-medium text-[#050505]">
              {application.email}
            </p>
          </div>
          <div className="grid gap-3 py-5 sm:grid-cols-[220px_1fr]">
            <p className="text-2xl font-medium text-[#98928d]">Documents</p>
            <p className="text-2xl font-medium text-[#050505]">
              {application.documents.length} submitted
            </p>
          </div>
        </div>
      </section>
    </DecisionPageFrame>
  );
}
