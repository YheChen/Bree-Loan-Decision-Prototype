import type { ReactNode } from "react";
import Link from "next/link";

type DecisionPageFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function getDecisionButtonClasses(variant: "primary" | "secondary") {
  if (variant === "primary") {
    return "inline-flex items-center justify-center rounded-[18px] border-2 border-black bg-[#1d6ff2] px-6 py-3 text-base font-medium text-white shadow-[8px_8px_0_#050505] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0_#050505]";
  }

  return "inline-flex items-center justify-center rounded-[18px] border border-[#e7dfd8] bg-[#fbf8f5] px-6 py-3 text-base font-medium text-[#050505] transition hover:bg-[#f4efeb]";
}

export function DecisionPageFrame({
  eyebrow,
  title,
  description,
  children,
  actions,
}: DecisionPageFrameProps) {
  return (
    <main className="min-h-screen bg-[#fbf4f1] px-0 py-0 text-[#0c0c0c] sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-[980px] rounded-none bg-white px-5 py-8 shadow-[0_1px_0_rgba(15,23,42,0.05)] sm:rounded-[40px] sm:px-10 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-[840px]">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f6a67] transition hover:text-[#050505]"
            href="/"
          >
            <span aria-hidden="true">←</span>
            Back to application
          </Link>

          <header className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a847f]">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#050505] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#6f6a67] sm:text-lg">
              {description}
            </p>

            {actions ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
            ) : null}
          </header>

          <div className="mt-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
