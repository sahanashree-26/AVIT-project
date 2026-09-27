export default function About() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">What is VitalSignAI?</h1>
        <p className="mt-3 text-ink-700">
          VitalSignAI is a final-year project that uses machine learning to provide an
          early diabetes risk prediction from a small set of standard health measurements.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Problem</h2>
        <p className="mt-2 text-ink-700">
          Diabetes risk can be difficult to identify early from health information alone.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">Solution</h2>
        <p className="mt-2 text-ink-700">
          VitalSignAI uses Logistic Regression to analyze selected health parameters and
          provide an early risk prediction.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">How it works</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-brand-700">
          {['Health Data', 'Data Validation', 'Preprocessing', 'Logistic Regression', 'Risk Prediction', 'MySQL Storage', 'Result'].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1">{step}</span>
              {i < arr.length - 1 && <span className="text-ink-700">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">About Logistic Regression</h2>
        <p className="mt-2 text-ink-700">
          Logistic Regression is a classification algorithm that estimates the probability
          of an outcome. In VitalSignAI, it is used to estimate diabetes risk from
          health-related input features.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Safety</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
          <li>VitalSignAI is not a replacement for a healthcare professional.</li>
          <li>The prediction is a risk estimate based on the information you provide, not a diagnosis.</li>
          <li>For serious or emergency symptoms, seek immediate professional or emergency care.</li>
        </ul>
      </div>

      <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        This system provides an ML-based early risk prediction for educational and
        screening purposes. It is not a medical diagnosis.
      </div>
    </div>
  )
}
