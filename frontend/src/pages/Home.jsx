import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, isLoggedIn } from '../services/api'

function LoggedInHome() {
  const [profile, setProfile] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getProfile(), api.history(), api.listMetrics()])
      .then(([p, hist, m]) => {
        setProfile(p)
        setAssessments(hist)
        setMetrics(m)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-ink-700">Loading…</p>

  const latest = assessments[0]
  const glucoseTrend = metrics.filter((m) => m.metric_type === 'glucose').slice(-5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Good to see you, {profile?.name?.split(' ')[0]}</h1>

      {!latest ? (
        <div className="card text-center">
          <p className="text-ink-700">You haven't completed an assessment yet.</p>
          <Link to="/assessment" className="btn-primary mt-4 inline-flex">Start Health Assessment</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-ink-700">Latest Assessment</p>
            <p className={`mt-1 text-xl font-bold ${latest.risk_category === 'Higher Risk' ? 'text-amber-600' : 'text-green-600'}`}>
              {latest.risk_category}
            </p>
            <p className="text-xs text-ink-700">{new Date(latest.created_at).toLocaleDateString()}</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-ink-700">Glucose</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{latest.glucose} <span className="text-sm font-normal">mg/dL</span></p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-ink-700">BMI</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{latest.bmi}</p>
          </div>
        </div>
      )}

      {glucoseTrend.length > 1 && (
        <div className="card">
          <p className="text-sm font-semibold text-ink-900">Glucose trend (last {glucoseTrend.length} readings)</p>
          <div className="mt-3 flex items-end gap-2" style={{ height: 80 }}>
            {glucoseTrend.map((m, i) => {
              const max = Math.max(...glucoseTrend.map((x) => x.value))
              const h = Math.max(8, Math.round((m.value / max) * 80))
              return <div key={i} className="w-6 rounded-t bg-brand-400" style={{ height: h }} title={`${m.value}`} />
            })}
          </div>
        </div>
      )}

      <div className="card">
        <p className="text-sm font-semibold text-ink-900">Recommended next steps</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/assessment" className="btn-secondary">New Assessment</Link>
          <Link to="/upload-report" className="btn-secondary">Upload a Report</Link>
          <Link to="/my-assessments" className="btn-secondary">View History</Link>
          <Link to="/education" className="btn-secondary">Health Insights</Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  if (isLoggedIn()) return <LoggedInHome />

  return (
    <div>
      <div className="flex flex-col items-center py-12 text-center">
        <span className="mb-4 rounded-full bg-brand-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Preventive Diabetes Health Companion
        </span>
        <h1 className="max-w-2xl text-4xl font-bold text-ink-900 sm:text-5xl">
          Understand your diabetes risk. Earlier.
        </h1>
        <p className="mt-4 max-w-xl text-ink-700">
          VitalSignAI helps you understand diabetes-related risk factors, analyze health information,
          and track your health over time.
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/register" className="btn-primary">Start Health Assessment</Link>
          <Link to="/about" className="btn-secondary">Learn More</Link>
        </div>
      </div>

      <div className="py-10">
        <h2 className="text-center text-xl font-bold text-ink-900">How it works</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
          {['Build your profile', 'Complete assessment', 'AI analyzes your information', 'Understand your result', 'Track your health'].map((step, i) => (
            <div key={step} className="card text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</div>
              <p className="text-sm text-ink-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3">
        <div className="card">
          <div className="text-2xl">🧠</div>
          <h3 className="mt-2 font-semibold">Explainable Prediction</h3>
          <p className="mt-1 text-sm text-ink-700">See exactly which factors influenced your result — not just a number.</p>
        </div>
        <div className="card">
          <div className="text-2xl">📊</div>
          <h3 className="mt-2 font-semibold">Health Trend Tracking</h3>
          <p className="mt-1 text-sm text-ink-700">Track glucose, weight, BMI, and blood pressure over time.</p>
        </div>
        <div className="card">
          <div className="text-2xl">📄</div>
          <h3 className="mt-2 font-semibold">Report Review</h3>
          <p className="mt-1 text-sm text-ink-700">Upload reports and keep a organized, comparable history of your values.</p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 p-5 text-sm text-amber-800">
        <strong>Privacy & Safety:</strong> Your health data is stored to power your personal dashboard
        only. VitalSignAI provides an AI/ML risk estimate for educational and preventive purposes — it
        is not a medical diagnosis and does not replace a healthcare professional.
      </div>
    </div>
  )
}
