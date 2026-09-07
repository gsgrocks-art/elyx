const STEPS = [
  { key: "processing", label: "Order In Process" },
  { key: "dispatched", label: "Order Dispatched" },
  { key: "delivered", label: "Order Delivered Successfully" },
];

export default function OrderStatusStepper({ status }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl bg-rose-50 p-4 text-center">
        <p className="font-heading text-lg text-rose-700">This order has been cancelled</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start justify-between gap-1">
      {STEPS.map((step, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const active = i === currentIndex;
        const reached = done || active;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${i === 0 ? "invisible" : reached ? "bg-[var(--color-primary)]" : "bg-neutral-200"}`}
              />
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  reached
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-neutral-300 bg-white text-neutral-400"
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div
                className={`h-0.5 flex-1 ${
                  i === STEPS.length - 1 ? "invisible" : done ? "bg-[var(--color-primary)]" : "bg-neutral-200"
                }`}
              />
            </div>
            <p
              className={`mt-2 px-1 text-xs leading-tight ${
                active ? "font-semibold text-[var(--color-primary)]" : reached ? "text-neutral-700" : "text-neutral-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
