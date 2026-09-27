import { useLocation, Link, Navigate } from 'react-router-dom'
import { buildInsights, buildDoctorQuestions } from '../utils/insights'

const INSIGHT_LABELS = {
  nutrition: 'Nutrition',
  activity: 'Physical Activity',
  sleep: 'Sleep',
  weight: 'Weight Management',
  monitoring: 'Monitoring',
  consultation: 'Professional Consultation',
}

function FactorBar({ label, value, contribution, maxAbs, tone }) {
  const pct = maxAbs > 0 ? Math.min(100, Math.round((Math.abs(contribution) / maxAbs) * 100)) : 0
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-ink-700">
        <span>{label} <span className="text-ink-700/70">({value})</span></span>
        <span>{contribution > 0 ? '+' : ''}{contribution.toFixed(2)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Result() {
  const location = useLocation()
  const result = location.state?.result

  if (!result) {
    return <Navigate to="/assessment" replace />
  }

  const isHigherRisk = result.risk_category === 'Higher Risk'
  const probabilityPct = Math.round(result.probability * 100)
  const explanation = result.explanation || { risk_factors: [], protective_factors: [] }
  const allContributions = [...explanation.risk_factors, ...explanation.protective_factors].map((f) => Math.abs(f.contribution))
  const maxAbs = allContributions.length ? Math.max(...allContributions) : 1

  const insights = buildInsights(result)
  const questions = buildDoctorQuestions(result)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Diabetes Risk Assessment — Result
        </span>

        <h1 className={`mt-3 text-3xl font-bold ${isHigherRisk ? 'text-amber-600' : 'text-green-600'}`}>
          {result.risk_category}
        </h1>
        <p className="mt-1 text-sm text-ink-700">{result.prediction}</p>

        <div className="mt-4">
          <div className="mx-auto h-3 w-full max-w-sm overflow-hidden rounded-full bg-ink-100">
            <div className={`h-full ${isHigherRisk ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${probabilityPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-700">
            Model probability: <span className="font-semibold">{probabilityPct}%</span>
          </p>
        </div>

        <p className="mt-6 text-xs text-ink-700">
          This is an AI/ML risk estimate, not a medical diagnosis.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Why this result?</h2>
        <p className="mt-1 text-sm text-ink-700">
          Computed directly from the trained model's coefficients — how much each factor pushed the prediction.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-amber-700">Risk-related factors</h3>
            {explanation.risk_factors.length === 0 && <p className="text-sm text-ink-700">None identified.</p>}
            {explanation.risk_factors.map((f) => (
              <FactorBar key={f.feature} label={f.feature} value={f.value} contribution={f.contribution} maxAbs={maxAbs} tone="bg-amber-500" />
            ))}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-green-700">Protective factors</h3>
            {explanation.protective_factors.length === 0 && <p className="text-sm text-ink-700">None identified.</p>}
            {explanation.protective_factors.map((f) => (
              <FactorBar key={f.feature} label={f.feature} value={f.value} contribution={f.contribution} maxAbs={maxAbs} tone="bg-green-500" />
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Preventive Insights</h2>
        <p className="mt-1 text-sm text-ink-700">General, evidence-based guidance — not a personalized treatment plan.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(insights).filter(([, tips]) => tips.length > 0).map(([key, tips]) => (
            <div key={key} className="rounded-lg bg-ink-50 p-3">
              <h3 className="text-sm font-semibold text-ink-800">{INSIGHT_LABELS[key]}</h3>
              <ul className="mt-1 list-disc pl-4 text-sm text-ink-700">
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Questions for your doctor</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
          {questions.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </div>

      <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        VitalSignAI is not a replacement for a healthcare professional. This result is a risk estimate,
        not a diagnosis. If you're experiencing symptoms that concern you, seek professional or
        emergency care.
      </div>

      <div className="flex justify-center gap-3">
        <Link to="/my-assessments" className="btn-primary">View My Assessments</Link>
        <Link to="/upload-report" className="btn-secondary">Upload a Report</Link>
      </div>
    </div>
  )
}
