"use client";

import { useState } from "react";
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
  return Object.entries(breakdown) as [ScoreFactorKey, ScoreBreakdown[ScoreFactorKey]][];
}

function getSelectedApplication(
  selectedId: string,
  applications: Application[],
) {
  return applications.find((application) => application.id === selectedId) ?? applications[0];
}

export default function Page() {
  const [selectedId, setSelectedId] = useState(flaggedApplications[0]?.id ?? "");
  const [notesById, setNotesById] = useState<Record<string, string>>(initialNotes);
  const [actionsById, setActionsById] = useState<
    Partial<Record<string, ReviewerAction>>
  >({});

  const selectedApplication = getSelectedApplication(selectedId, flaggedApplications);

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

  return (
    <main className="min-h-screen bg-[#fbf4f1] px-0 py-0 text-[#0c0c0c] sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-[1260px] rounded-none bg-white px-5 py-8 shadow-[0_1px_0_rgba(15,23,42,0.05)] sm:rounded-[40px] sm:px-10 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-[1120px]">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f6a67] transition hover:text-[#050505]"
            href="/"
          >
            <span aria-hidden="true">←</span>
            Back to application
          </Link>

          <header className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a847f]">
              Admin review queue
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#050505] sm:text-5xl">
              Flagged applications
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#6f6a67] sm:text-lg">
              This prototype shows the reviewer workflow for a sample queue. The
              design is optimized for fast triage: see the riskiest issue at a
              glance, open one file, and make a confident next-step decision.
            </p>
          </header>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                Queue size
              </p>
              <p className="mt-3 text-4xl font-semibold text-[#050505]">
                {flaggedApplications.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                Sample applications drawn from a hypothetical 50-per-day flagged
                workflow.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ece6e1] bg-[#fbf8f5] px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                Ready for review
              </p>
              <p className="mt-3 text-4xl font-semibold text-[#050505]">
                {readyForReviewCount}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                These files have enough supporting data for an immediate human
                decision.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ece6e1] bg-white px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                Actioned in demo
              </p>
              <p className="mt-3 text-4xl font-semibold text-[#050505]">
                {actionedCount}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                Local-only decisions recorded during this session.
              </p>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="rounded-[32px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                    Review queue
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
                    Applications needing attention
                  </h2>
                </div>
                <span className="rounded-full border border-[#ece6e1] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                  {flaggedApplications.length} open
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {flaggedApplications.map((application) => {
                  const isSelected = application.id === selectedApplication.id;
                  const action = actionsById[application.id];

                  return (
                    <button
                      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-[#050505] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                          : "border-[#ece6e1] bg-white hover:border-[#d7d0ca]"
                      }`}
                      key={application.id}
                      onClick={() => setSelectedId(application.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-[#050505]">
                            {application.applicant}
                          </p>
                          <p className="mt-1 text-sm text-[#6f6a67]">
                            {formatCurrency(application.loanAmount)} requested
                          </p>
                        </div>
                        <span className="rounded-full border border-[#ece6e1] bg-[#fbf8f5] px-2.5 py-1 text-xs font-semibold text-[#6f6a67]">
                          Score {application.score}
                        </span>
                      </div>

                      <p className="mt-4 text-sm font-medium text-[#6f6a67]">
                        {getFocusLabel(application)}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-[#8a847f]">
                        <span>{application.id}</span>
                        <span>{getActionLabel(action)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
                <div className="flex flex-col gap-4 border-b border-[#ece6e1] pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                      Selected file
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#050505]">
                      {selectedApplication.applicant}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#6f6a67]">
                      {selectedApplication.email}
                    </p>
                  </div>

                  <div
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${getActionTone(selectedAction)}`}
                  >
                    {getActionLabel(selectedAction)}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                      Requested amount
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#050505]">
                      {formatCurrency(selectedApplication.loanAmount)}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                      Monthly income
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#050505]">
                      {formatCurrency(selectedApplication.statedMonthlyIncome)}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                      Employment
                    </p>
                    <p className="mt-3 text-2xl font-semibold capitalize text-[#050505]">
                      {selectedApplication.employmentStatus}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a847f]">
                      Mock score
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#050505]">
                      {selectedApplication.score} / 100
                    </p>
                  </div>
                </div>

                {extractionCopy ? (
                  <div className="mt-6 rounded-[24px] border border-[#f0dfd7] bg-[#fff7f2] px-5 py-5">
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
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                        Score breakdown
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#050505]">
                        Why this file was flagged
                      </h3>
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
                </div>

                <div className="space-y-6">
                  <section className="rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                      Submitted documents
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#050505]">
                      Files on record
                    </h3>

                    {selectedApplication.documents.length === 0 ? (
                      <div className="mt-6 rounded-[24px] border border-[#f0dfd7] bg-[#fff7f2] px-5 py-5">
                        <p className="text-base font-semibold text-[#050505]">
                          No documents submitted
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6f6a67]">
                          This file should usually move straight to a document
                          request, not a deeper review.
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

                  <section className="rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                      Reviewer action
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#050505]">
                      Choose the next step
                    </h3>

                    <div className="mt-6 grid gap-3">
                      <button
                        className={`rounded-[20px] border px-4 py-3 text-left text-base font-semibold transition ${
                          selectedAction === "approve"
                            ? "border-[#050505] bg-white text-[#050505]"
                            : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#d7d0ca]"
                        }`}
                        onClick={() => setReviewerAction("approve")}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className={`rounded-[20px] border px-4 py-3 text-left text-base font-semibold transition ${
                          selectedAction === "deny"
                            ? "border-[#050505] bg-white text-[#050505]"
                            : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#d7d0ca]"
                        }`}
                        onClick={() => setReviewerAction("deny")}
                        type="button"
                      >
                        Deny
                      </button>
                      <button
                        className={`rounded-[20px] border px-4 py-3 text-left text-base font-semibold transition ${
                          selectedAction === "request_documents"
                            ? "border-[#050505] bg-white text-[#050505]"
                            : "border-[#ece6e1] bg-[#fbf8f5] text-[#050505] hover:border-[#d7d0ca]"
                        }`}
                        onClick={() => setReviewerAction("request_documents")}
                        type="button"
                      >
                        Request documents
                      </button>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-[#ece6e1] bg-[#fbf8f5] px-5 py-5">
                      <p className="text-sm leading-6 text-[#6f6a67]">
                        Actions are local to this prototype. They do not
                        persist, but they demonstrate the intended reviewer
                        workflow.
                      </p>

                      {selectedAction === "request_documents" ? (
                        <Link
                          className="mt-4 inline-flex items-center text-sm font-semibold text-[#050505] transition hover:text-[#6f6a67]"
                          href={`/reupload/${selectedApplication.id}`}
                        >
                          Open applicant re-upload flow →
                        </Link>
                      ) : null}
                    </div>
                  </section>
                </div>
              </section>

              <section className="rounded-[32px] border border-[#ece6e1] bg-white px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
                  Reviewer notes
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#050505]">
                  Internal notes for this file
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6a67]">
                  Notes are intentionally lightweight here. The goal is to help
                  reviewers preserve context without slowing down the queue.
                </p>

                <textarea
                  className="mt-6 min-h-[180px] w-full rounded-[24px] border border-[#e7dfd8] bg-[#fbf8f5] px-5 py-4 text-base leading-7 text-[#050505] outline-none transition focus:border-[#050505]"
                  onChange={(event) => updateNotes(event.target.value)}
                  placeholder="Add reviewer context, follow-up items, or the rationale for your decision."
                  value={selectedNote}
                />

                <div className="mt-4 flex flex-col gap-3 text-sm text-[#6f6a67] sm:flex-row sm:items-center sm:justify-between">
                  <p>Saved locally for demo purposes.</p>
                  <p>{selectedNote.trim().length} characters</p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
