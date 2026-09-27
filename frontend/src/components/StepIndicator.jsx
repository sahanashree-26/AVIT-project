export default function StepIndicator({ steps, current }) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isDone = stepNum < current
        const isActive = stepNum === current
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold
                  ${isDone ? 'bg-brand-600 text-white' : isActive ? 'border-2 border-brand-600 text-brand-700' : 'border border-ink-100 text-ink-700'}`}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span className={`mt-1 hidden text-[11px] sm:block ${isActive ? 'font-semibold text-brand-700' : 'text-ink-700'}`}>
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-brand-600' : 'bg-ink-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
