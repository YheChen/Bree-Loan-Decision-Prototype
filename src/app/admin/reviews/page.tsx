"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { getFlaggedApplications } from "@/lib/getFlaggedApplications";
import type {
  Application,
  ExtractionError,
  ScoreBreakdown,
  ScoreFactorKey,
} from "@/types/application";

type ReviewerAction = "approve" | "deny" | "request_documents";

const factorLabels: Record<ScoreFactorKey, string> = {
  incomeVerification: "Income verification",
  incomeLevel: "Income level",
  accountStability: "Account stability",
  employmentStatus: "Employment status",
  debtToIncome: "Debt-to-income proxy",
};

const flaggedApplications = getFlaggedApplications();

const initialNotes: Record<string, string> = {
  "app-003":
    "Small-dollar request with weak financial signals. Worth a quick human check before denying.",
  "app-004":
    "Core documents look strong, but the requested amount sits close to the applicant's monthly income.",
  "app-005":
    "No documents attached. Request upload first instead of spending reviewer time on a partial file.",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getFocusLabel(application: Application) {
  if (application.extractionError === "no_documents_provided") {
    return "Needs documents";
  }

  if (application.score >= 65) {
    return "Near auto-approve threshold";
  }

  if (application.loanAmount <= 500) {
    return "Low-dollar manual check";
  }

  return "Mixed risk signals";
}

function getActionLabel(action: ReviewerAction | undefined) {
  if (action === "approve") {
    return "Marked approved";
  }

  if (action === "deny") {
    return "Marked denied";
  }

  if (action === "request_documents") {
    return "Documents requested";
  }

  return "Awaiting reviewer action";
}

function getActionTone(action: ReviewerAction | undefined) {
  if (action === "approve") {
    return "border-[#dcebdd] bg-[#f4fbf5] text-[#45664a]";
  }

  if (action === "deny") {
    return "border-[#f0dfd7] bg-[#fff7f2] text-[#8e5c4d]";
  }

  if (action === "request_documents") {
    return "border-[#eadfcd] bg-[#f8f1e8] text-[#7f674f]";
  }

  return "border-[#ece6e1] bg-[#fbf8f5] text-[#6f6a67]";
}

function getExtractionCopy(error: ExtractionError | undefined) {
  if (error === "no_documents_provided") {
    return "No supporting documents were uploaded, so the reviewer cannot verify income or account stability.";
  }

  return undefined;
}

function getBreakdownEntries(breakdown: ScoreBreakdown) {
  return Object.entries(breakdown) as [
    ScoreFactorKey,
    ScoreBreakdown[ScoreFactorKey],
  ][];
}

function getSelectedApplication(
  selectedId: string,
  applications: Application[],
) {
  return (
    applications.find((application) => application.id === selectedId) ??
    applications[0]
  );
}

function SummaryCard({
  title,
  value,
  description,
  accent = false,
}: {
  title: string;
  value: string | number;
  description?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border px-6 py-6 ${
        accent ? "border-[#d7e6ff] bg-[#f3f8ff]" : "border-[#ece6e1] bg-white"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-[0.14em] ${
          accent ? "text-[#1d6ff2]" : "text-[#8a847f]"
        }`}
      >
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[#050505] sm:text-3xl">
        {value}
      </p>
      {description ? (
        <p
          className={`mt-2 text-sm leading-6 ${
            accent ? "text-[#5f6d81]" : "text-[#6f6a67]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="grid items-center gap-3 py-5 sm:grid-cols-[220px_1fr]">
      <p className="text-lg font-medium text-[#98928d]">{label}</p>
      <p
        className={`text-right text-xl font-semibold sm:text-2xl ${
          accent ? "text-[#1d6ff2]" : "text-[#050505]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function Page() {
  const queueScrollRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState(
    flaggedApplications[0]?.id ?? "",
  );
  const [notesById, setNotesById] =
    useState<Record<string, string>>(initialNotes);
  const [actionsById, setActionsById] = useState<
    Partial<Record<string, ReviewerAction>>
  >({});

  const selectedApplication = getSelectedApplication(
    selectedId,
    flaggedApplications,
  );

  if (!selectedApplication) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf4f1] px-6 py-16">
        <div className="w-full max-w-lg rounded-[36px] bg-white p-10 text-center shadow-[0_1px_0_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold tracking-tight text-[#050505]">
            No flagged applications
          </h1>
          <p className="mt-4 text-base leading-7 text-[#6f6a67]">
            The review queue is empty in the current mock dataset.
          </p>
        </div>
      </main>
    );
  }

  const selectedAction = actionsById[selectedApplication.id];
  const selectedNote = notesById[selectedApplication.id] ?? "";
  const extractionCopy = getExtractionCopy(selectedApplication.extractionError);
  const needsDocumentsCount = flaggedApplications.filter(
    (application) => application.extractionError === "no_documents_provided",
  ).length;
  const readyForReviewCount = flaggedApplications.length - needsDocumentsCount;
  const actionedCount = Object.values(actionsById).filter(Boolean).length;

  function updateNotes(value: string) {
    setNotesById((currentNotes) => ({
      ...currentNotes,
      [selectedApplication.id]: value,
    }));
  }

  function setReviewerAction(action: ReviewerAction) {
    setActionsById((currentActions) => ({
      ...currentActions,
      [selectedApplication.id]: action,
    }));
  }

  function scrollQueue(direction: "left" | "right") {
    queueScrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-[#fbf4f1] px-0 py-0 text-[#0c0c0c] sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto w-full rounded-none bg-white px-5 py-8 shadow-[0_1px_0_rgba(15,23,42,0.05)] sm:rounded-[40px] sm:px-10 sm:py-12 lg:w-1/2 lg:px-12">
        <div className="mx-auto max-w-[1080px]">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f6a67] transition hover:text-[#050505]"
            href="/"
          >
            <span aria-hidden="true">←</span>
            Back to application
          </Link>

          <header className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1d6ff2]">
              Admin review queue
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#050505] sm:text-5xl">
              Flagged applications
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#6f6a67] sm:text-lg">
              This prototype shows the reviewer workflow for a sample queue. The
              design is optimized for fast triage: surface the biggest issue
              quickly, review the context, and take the next step without
              unnecessary clicks.
            </p>
          </header>

          <section className="mt-10 rounded-[32px] border border-[#ece6e1] bg-[#fbf8f5] p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard
                description="Sample applications drawn from a hypothetical 50-per-day flagged workflow."
                title="Queue size"
                value={flaggedApplications.length}
              />
              <SummaryCard
                description="These files have enough supporting data for an immediate human decision."
                title="Ready for review"
                value={readyForReviewCount}
              />
              <SummaryCard
                description="Local-only decisions recorded during this session."
                title="Actioned in demo"
                value={actionedCount}
              />
            </div>
          </section>

          <section className="mt-10 rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                  Review queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
                  Applications needing attention
                </h2>
              </div>
              <span className="rounded-full border border-[#ece6e1] bg-[#fbf8f5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                {flaggedApplications.length} open
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                aria-label="Scroll review queue left"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7dfd8] bg-[#fbf8f5] text-base font-semibold text-[#050505] transition hover:bg-[#f4efeb]"
                onClick={() => scrollQueue("left")}
                type="button"
              >
                &lt;
              </button>

              <div className="overflow-x-auto pb-2" ref={queueScrollRef}>
                <div className="flex min-w-max gap-3">
                {flaggedApplications.map((application) => {
                  const isSelected = application.id === selectedApplication.id;
                  const action = actionsById[application.id];

                  return (
                    <button
                      className={`w-[280px] shrink-0 rounded-[22px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-[#1d6ff2] bg-white text-[#1d6ff2] shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                          : "border-[#ece6e1] bg-white hover:border-[#cfdffc] hover:bg-[#fbf8f5]"
                      }`}
                      key={application.id}
                      onClick={() => setSelectedId(application.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[#050505]">
                            {application.applicant}
                          </p>
                          <p className="mt-1 text-sm text-[#6f6a67]">
                            {formatCurrency(application.loanAmount)} requested
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            isSelected
                              ? "border-[#d7e6ff] bg-[#f3f8ff] text-[#1d6ff2]"
                              : "border-[#ece6e1] bg-white text-[#6f6a67]"
                          }`}
                        >
                          Score {application.score}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                            isSelected
                              ? "border-[#d7e6ff] bg-[#f3f8ff] text-[#1d6ff2]"
                              : "border-[#ece6e1] bg-white text-[#6f6a67]"
                          }`}
                        >
                          {getFocusLabel(application)}
                        </span>
                        <span className="rounded-full border border-[#ece6e1] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a847f]">
                          {application.id}
                        </span>
                      </div>

                      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#8a847f]">
                        {getActionLabel(action)}
                      </p>
                    </button>
                  );
                })}
                </div>
              </div>

              <button
                aria-label="Scroll review queue right"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7dfd8] bg-[#fbf8f5] text-base font-semibold text-[#050505] transition hover:bg-[#f4efeb]"
                onClick={() => scrollQueue("right")}
                type="button"
              >
                &gt;
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
            <div className="flex flex-col gap-4 border-b border-[#ece6e1] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1d6ff2]">
                  Submitted documents
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
                  {selectedApplication.applicant}
                </h2>
                <p className="mt-2 text-base leading-7 text-[#6f6a67]">
                  {selectedApplication.email}
                </p>
              </div>

              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${getActionTone(selectedAction)}`}
              >
                {getActionLabel(selectedAction)}
              </div>
            </div>

            <div className="mt-6 divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
              <DetailRow
                label="Requested amount"
                value={formatCurrency(selectedApplication.loanAmount)}
              />
              <DetailRow
                label="Monthly income"
                value={formatCurrency(selectedApplication.statedMonthlyIncome)}
              />
              <DetailRow
                label="Employment"
                value={
                  selectedApplication.employmentStatus === "self-employed"
                    ? "Self-employed"
                    : "Employed"
                }
              />
              <DetailRow
                accent
                label="Mock score"
                value={`${selectedApplication.score} / 100`}
              />
            </div>

            {extractionCopy ? (
              <div className="mt-6 rounded-[22px] border border-[#f0dfd7] bg-[#fff7f2] px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8e5c4d]">
                  Extraction issue
                </p>
                <p className="mt-3 text-lg font-semibold text-[#050505]">
                  Documents missing
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                  {extractionCopy}
                </p>
              </div>
            ) : null}

            {selectedApplication.documents.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-[#f0dfd7] bg-[#fff7f2] px-5 py-5">
                <p className="text-base font-semibold text-[#050505]">
                  No documents submitted
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                  This file should usually move straight to a document request,
                  not a deeper review.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedApplication.documents.map((document) => (
                  <span
                    className="rounded-full border border-[#ece6e1] bg-[#fbf8f5] px-4 py-2 text-sm font-medium text-[#050505]"
                    key={document}
                  >
                    {document}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                  Score breakdown
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
                  Why this file was flagged
                </h2>
              </div>
              <span className="hidden rounded-full border border-[#ece6e1] bg-[#fbf8f5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a847f] sm:inline-flex">
                Internal only
              </span>
            </div>

            <div className="mt-6 divide-y divide-[#ece6e1] border-y border-[#ece6e1]">
              {getBreakdownEntries(selectedApplication.breakdown).map(
                ([key, factor]) => (
                  <div
                    className="grid gap-3 py-5 lg:grid-cols-[190px_110px_1fr]"
                    key={key}
                  >
                    <div>
                      <p className="text-base font-semibold text-[#050505]">
                        {factorLabels[key]}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8a847f]">
                        Weight {Math.round(factor.weight * 100)}%
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-[#050505]">
                      {factor.score} / 100
                    </p>

                    <p className="text-sm leading-6 text-[#6f6a67]">
                      {factor.note}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mt-6 rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
              Reviewer notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
              Add notes and choose the next step
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6a67]">
              Notes are intentionally lightweight here. The goal is to help
              reviewers preserve context without slowing down the queue.
            </p>

            <textarea
              className="mt-6 min-h-[180px] w-full rounded-[24px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base leading-7 text-[#050505] outline-none transition focus:border-[#1d6ff2]"
              onChange={(event) => updateNotes(event.target.value)}
              placeholder="Add reviewer context, follow-up items, or the rationale for your decision."
              value={selectedNote}
            />

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#6f6a67] sm:flex-row sm:items-center sm:justify-between">
              <p>Saved locally for demo purposes.</p>
              <p>{selectedNote.trim().length} characters</p>
            </div>

            <div className="mt-8 border-t border-[#ece6e1] pt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                Reviewer action
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#050505]">
                Select next steps
              </h3>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button
                  className={`rounded-[20px] border px-4 py-3 text-center text-base font-semibold transition ${
                    selectedAction === "approve"
                      ? "border-[#1d6ff2] bg-white text-[#1d6ff2]"
                      : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#cfdffc]"
                  }`}
                  onClick={() => setReviewerAction("approve")}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className={`rounded-[20px] border px-4 py-3 text-center text-base font-semibold transition ${
                    selectedAction === "deny"
                      ? "border-[#1d6ff2] bg-white text-[#1d6ff2]"
                      : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#cfdffc]"
                  }`}
                  onClick={() => setReviewerAction("deny")}
                  type="button"
                >
                  Deny
                </button>
                <button
                  className={`rounded-[20px] border px-4 py-3 text-center text-base font-semibold transition ${
                    selectedAction === "request_documents"
                      ? "border-[#1d6ff2] bg-white text-[#1d6ff2]"
                      : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#cfdffc]"
                  }`}
                  onClick={() => setReviewerAction("request_documents")}
                  type="button"
                >
                  Request documents
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
