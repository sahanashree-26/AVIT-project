import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import StepIndicator from '../components/StepIndicator'

const STEPS = ['Basic Info', 'Body', 'Lab Values', 'Lifestyle', 'Review']

const initialForm = {
  age: '', gender: '', pregnancies: '',
  blood_pressure: '', skin_thickness: '', bmi: '',
  glucose: '', insulin: '', diabetes_pedigree: '',
  physical_activity_level: 'moderate', sleep_hours: '', smoking: false,
  alcohol: false, family_history_diabetes: false,
}

export default function Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  function validateStep() {
    if (step === 1) {
      if (!form.age || !form.gender || form.pregnancies === '') return 'Please fill in all required fields.'
      if (form.age < 1 || form.age > 120) return 'Please enter a reasonable age.'
    }
    if (step === 2) {
      if (!form.blood_pressure || !form.skin_thickness || !form.bmi) return 'Please fill in all required fields.'
    }
    if (step === 3) {
      if (!form.glucose || !form.insulin || !form.diabetes_pedigree) return 'Please fill in all required fields.'
    }
    return ''
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  async function onSubmit() {
    setError('')
    setLoading(true)
    try {
      // Save lifestyle context to the health profile (used for insights only —
      // never sent to the ML model, which only uses the 8 trained features).
      await api.updateHealthProfile({
        physical_activity_level: form.physical_activity_level,
        sleep_hours: form.sleep_hours ? Number(form.sleep_hours) : undefined,
        smoking: form.smoking,
        alcohol: form.alcohol,
        family_history_diabetes: form.family_history_diabetes,
      }).catch(() => {}) // non-fatal if this fails; prediction is what matters

      const result = await api.predict({
        pregnancies: Number(form.pregnancies),
        glucose: Number(form.glucose),
        blood_pressure: Number(form.blood_pressure),
        skin_thickness: Number(form.skin_thickness),
        insulin: Number(form.insulin),
        bmi: Number(form.bmi),
        diabetes_pedigree: Number(form.diabetes_pedigree),
        age: Number(form.age),
      })
      navigate('/result', { state: { result } })
    } catch (err) {
      setError(err.message || 'Unable to complete the assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">Health Assessment</h1>
        <p className="mt-1 text-sm text-ink-700">
          A few quick steps for an ML-based diabetes risk prediction.
        </p>

        <div className="mt-6">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Age</label>
              <input className="input-field" type="number" name="age" value={form.age} onChange={onChange} placeholder="35" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" name="gender" value={form.gender} onChange={onChange}>
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Pregnancies</label>
              <input className="input-field" type="number" name="pregnancies" value={form.pregnancies} onChange={onChange} placeholder="0" min="0" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Blood Pressure — diastolic (mm Hg)</label>
              <input className="input-field" type="number" name="blood_pressure" value={form.blood_pressure} onChange={onChange} placeholder="e.g. 72" />
            </div>
            <div>
              <label className="label">Skin Thickness (mm)</label>
              <input className="input-field" type="number" name="skin_thickness" value={form.skin_thickness} onChange={onChange} placeholder="e.g. 22" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">BMI</label>
              <input className="input-field" type="number" step="0.1" name="bmi" value={form.bmi} onChange={onChange} placeholder="e.g. 27.5" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Glucose (mg/dL)</label>
              <input className="input-field" type="number" name="glucose" value={form.glucose} onChange={onChange} placeholder="e.g. 120" />
            </div>
            <div>
              <label className="label">Insulin (mu U/ml)</label>
              <input className="input-field" type="number" name="insulin" value={form.insulin} onChange={onChange} placeholder="e.g. 85" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Diabetes Pedigree Function</label>
              <input className="input-field" type="number" step="0.001" name="diabetes_pedigree" value={form.diabetes_pedigree} onChange={onChange} placeholder="e.g. 0.45" />
              <p className="mt-1 text-xs text-ink-700">A score reflecting diabetes likelihood based on family history.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-ink-700">
              These lifestyle questions help shape your preventive guidance — they are saved to your
              health profile but are not sent to the prediction model.
            </p>
            <div>
              <label className="label">Physical Activity Level</label>
              <select className="input-field" name="physical_activity_level" value={form.physical_activity_level} onChange={onChange}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Average Sleep (hours/night)</label>
              <input className="input-field" type="number" step="0.5" name="sleep_hours" value={form.sleep_hours} onChange={onChange} placeholder="e.g. 7" />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" name="smoking" checked={form.smoking} onChange={onChange} /> Smoking
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" name="alcohol" checked={form.alcohol} onChange={onChange} /> Alcohol
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" name="family_history_diabetes" checked={form.family_history_diabetes} onChange={onChange} /> Family history of diabetes
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">Review your entries</h2>
            <div className="grid grid-cols-2 gap-y-1.5 rounded-lg bg-ink-50 p-4 text-sm text-ink-700">
              <span>Age</span><span className="text-right">{form.age}</span>
              <span>Gender</span><span className="text-right">{form.gender}</span>
              <span>Pregnancies</span><span className="text-right">{form.pregnancies}</span>
              <span>Blood Pressure (diastolic)</span><span className="text-right">{form.blood_pressure}</span>
              <span>Skin Thickness</span><span className="text-right">{form.skin_thickness}</span>
              <span>BMI</span><span className="text-right">{form.bmi}</span>
              <span>Glucose</span><span className="text-right">{form.glucose}</span>
              <span>Insulin</span><span className="text-right">{form.insulin}</span>
              <span>Diabetes Pedigree</span><span className="text-right">{form.diabetes_pedigree}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button onClick={back} className="btn-secondary">Back</button>
          ) : <span />}

          {step < STEPS.length ? (
            <button onClick={next} className="btn-primary">Continue</button>
          ) : (
            <button onClick={onSubmit} disabled={loading} className="btn-primary">
              {loading ? 'Predicting…' : 'Predict Diabetes Risk'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
