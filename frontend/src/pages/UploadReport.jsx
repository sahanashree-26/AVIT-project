import { useEffect, useState } from 'react'
import { api } from '../services/api'

const METRIC_OPTIONS = ['Glucose', 'HbA1c', 'Blood Pressure', 'Weight', 'BMI', 'Cholesterol', 'Other']

export default function UploadReport() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [comparison, setComparison] = useState(null)
  const [metricForm, setMetricForm] = useState({ reportId: null, metric_name: 'Glucose', value: '', unit: '', reference_range: '' })

  function loadReports() {
    api.listReports().then(setReports).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReports()
    api.compareReports().then(setComparison).catch(() => {})
  }, [])

  async function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      await api.uploadReport(file)
      loadReports()
    } catch (err) {
      setError(err.message || 'Unable to upload report. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function onAddMetric(e) {
    e.preventDefault()
    if (!metricForm.reportId || !metricForm.value) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    try {
      await api.addReportMetric(metricForm.reportId, {
        metric_name: metricForm.metric_name,
        value: Number(metricForm.value),
        unit: metricForm.unit || null,
        reference_range: metricForm.reference_range || null,
      })
      setMetricForm({ reportId: null, metric_name: 'Glucose', value: '', unit: '', reference_range: '' })
      loadReports()
      api.compareReports().then(setComparison).catch(() => {})
    } catch (err) {
      setError(err.message || 'Unable to save this value. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">Upload Report</h1>
        <p className="mt-1 text-sm text-ink-700">
          Upload a health/medical report (PDF, JPG, or PNG, max 10 MB).
        </p>
        <p className="mt-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-700">
          Automatic extraction (OCR) isn't available in this build. After uploading, enter the values you
          see on the report yourself below — nothing is ever auto-filled or guessed.
        </p>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

        <label className="btn-primary mt-4 inline-flex cursor-pointer">
          {uploading ? 'Uploading…' : 'Choose File'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onFileChange} disabled={uploading} />
        </label>
      </div>

      {comparison?.comparable && (
        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900">Report Comparison</h2>
          <p className="mt-1 text-xs text-ink-700">Latest vs. previous reviewed report.</p>
          <div className="mt-3 space-y-2">
            {comparison.comparisons.length === 0 && <p className="text-sm text-ink-700">No shared metrics between your last two reports yet.</p>}
            {comparison.comparisons.map((c) => (
              <div key={c.metric_name} className="flex items-center justify-between rounded-lg bg-ink-50 p-3 text-sm">
                <span className="font-medium text-ink-800">{c.metric_name}</span>
                <span className="text-ink-700">Previous: {c.previous} {c.unit || ''}</span>
                <span className="text-ink-700">Latest: {c.latest} {c.unit || ''}</span>
                <span className={c.change > 0 ? 'font-semibold text-amber-600' : c.change < 0 ? 'font-semibold text-green-600' : 'font-semibold text-ink-700'}>
                  {c.change > 0 ? '+' : ''}{c.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Your Reports</h2>

        {loading ? (
          <p className="mt-4 text-sm text-ink-700">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="mt-4 text-sm text-ink-700">No reports yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="rounded-lg border border-ink-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-800">{r.filename}</p>
                    <p className="text-xs text-ink-700">
                      {new Date(r.uploaded_at).toLocaleString()} · {r.file_type.toUpperCase()} ·{' '}
                      {(r.file_size_bytes / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.status === 'reviewed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.status === 'reviewed' ? 'Reviewed' : 'Awaiting Review'}
                  </span>
                </div>

                {r.metrics.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {r.metrics.map((m) => (
                      <div key={m.id} className="rounded bg-ink-50 p-2 text-xs">
                        <p className="font-medium text-ink-800">{m.metric_name}</p>
                        <p className="text-ink-700">{m.value} {m.unit || ''}</p>
                        {m.reference_range && <p className="text-ink-700/70">Ref: {m.reference_range}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setMetricForm({ ...metricForm, reportId: r.id })}
                  className="btn-secondary mt-3 !px-3 !py-1.5 text-xs"
                >
                  + Enter a value from this report
                </button>

                {metricForm.reportId === r.id && (
                  <form onSubmit={onAddMetric} className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-ink-50 p-3 sm:grid-cols-4">
                    <select className="input-field !py-1.5 text-xs" value={metricForm.metric_name}
                      onChange={(e) => setMetricForm({ ...metricForm, metric_name: e.target.value })}>
                      {METRIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input className="input-field !py-1.5 text-xs" type="number" step="0.01" placeholder="Value"
                      value={metricForm.value} onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })} />
                    <input className="input-field !py-1.5 text-xs" placeholder="Unit (optional)"
                      value={metricForm.unit} onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })} />
                    <input className="input-field !py-1.5 text-xs" placeholder="Reference range (optional)"
                      value={metricForm.reference_range} onChange={(e) => setMetricForm({ ...metricForm, reference_range: e.target.value })} />
                    <button type="submit" className="btn-primary col-span-2 !py-1.5 text-xs sm:col-span-4">Save Value</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
