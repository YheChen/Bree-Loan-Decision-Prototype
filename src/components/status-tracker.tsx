export type TrackerStep = {
  label: string;
  detail: string;
  state: "complete" | "current" | "upcoming";
};

type StatusTrackerProps = {
  title?: string;
  steps: TrackerStep[];
};

function getStepClasses(state: TrackerStep["state"]) {
  if (state === "complete") {
    return {
      card: "border-[#ece6e1] bg-[#fbf8f5]",
      marker: "border-[#050505] bg-[#050505] text-white",
      label: "text-[#050505]",
      detail: "text-[#6f6a67]",
    };
  }

  if (state === "current") {
    return {
      card: "border-[#050505] bg-white",
      marker: "border-[#050505] bg-white text-[#050505]",
      label: "text-[#050505]",
      detail: "text-[#6f6a67]",
    };
  }

  return {
    card: "border-[#ece6e1] bg-[#fbf8f5]",
    marker: "border-[#d7d0ca] bg-[#fbf8f5] text-[#9d9791]",
    label: "text-[#6f6a67]",
    detail: "text-[#9d9791]",
  };
}

export function StatusTracker({
  title = "Application progress",
  steps,
}: StatusTrackerProps) {
  return (
    <section className="border-t border-[#ece6e1] pt-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a847f]">
        {title}
      </p>

      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const styles = getStepClasses(step.state);

          return (
            <li
              className={`rounded-[28px] border px-5 py-5 ${styles.card}`}
              key={`${step.label}-${index}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${styles.marker}`}
                >
                  {step.state === "complete" ? "✓" : index + 1}
                </span>
                <div>
                  <p className={`text-base font-semibold ${styles.label}`}>
                    {step.label}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${styles.detail}`}>
                    {step.detail}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
