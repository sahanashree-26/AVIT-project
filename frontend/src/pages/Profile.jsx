import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', age: '', gender: '' })
  const [healthProfile, setHealthProfile] = useState(null)
  const [hpForm, setHpForm] = useState({
    height_cm: '', weight_kg: '', blood_pressure_systolic: '', blood_pressure_diastolic: '',
    physical_activity_level: 'moderate', sleep_hours: '', smoking: false, alcohol: false,
    family_history_diabetes: false, existing_conditions: '', medications: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.getProfile(), api.getHealthProfile()])
      .then(([p, hp]) => {
        setProfile(p)
        setForm({ name: p.name, age: p.age, gender: p.gender })
        setHealthProfile(hp)
        setHpForm({
          height_cm: hp.height_cm ?? '', weight_kg: hp.weight_kg ?? '',
          blood_pressure_systolic: hp.blood_pressure_systolic ?? '', blood_pressure_diastolic: hp.blood_pressure_diastolic ?? '',
          physical_activity_level: hp.physical_activity_level ?? 'moderate', sleep_hours: hp.sleep_hours ?? '',
          smoking: !!hp.smoking, alcohol: !!hp.alcohol, family_history_diabetes: !!hp.family_history_diabetes,
          existing_conditions: hp.existing_conditions ?? '', medications: hp.medications ?? '',
        })
      })
      .catch((err) => setError(err.message || 'Unable to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  function onHpChange(e) {
    const { name, value, type, checked } = e.target
    setHpForm({ ...hpForm, [name]: type === 'checkbox' ? checked : value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name || !form.age || !form.gender) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    try {
      const updated = await api.updateProfile({ ...form, age: Number(form.age) })
      setProfile(updated)

      const hpUpdated = await api.updateHealthProfile({
        height_cm: hpForm.height_cm ? Number(hpForm.height_cm) : undefined,
        weight_kg: hpForm.weight_kg ? Number(hpForm.weight_kg) : undefined,
        blood_pressure_systolic: hpForm.blood_pressure_systolic ? Number(hpForm.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: hpForm.blood_pressure_diastolic ? Number(hpForm.blood_pressure_diastolic) : undefined,
        physical_activity_level: hpForm.physical_activity_level,
        sleep_hours: hpForm.sleep_hours ? Number(hpForm.sleep_hours) : undefined,
        smoking: hpForm.smoking,
        alcohol: hpForm.alcohol,
        family_history_diabetes: hpForm.family_history_diabetes,
        existing_conditions: hpForm.existing_conditions || undefined,
        medications: hpForm.medications || undefined,
      })
      setHealthProfile(hpUpdated)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-ink-700">Loading…</p>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">Profile</h1>
        <p className="mt-1 text-sm text-ink-700">{profile?.email}</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{success}</div>}

        <form onSubmit={onSubmit} className="mt-6 space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">Account</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Name</label>
                <input className="input-field" name="name" value={form.name} onChange={onChange} />
              </div>
              <div>
                <label className="label">Age</label>
                <input className="input-field" type="number" name="age" value={form.age} onChange={onChange} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field" name="gender" value={form.gender} onChange={onChange}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">Health Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Height (cm)</label>
                <input className="input-field" type="number" name="height_cm" value={hpForm.height_cm} onChange={onHpChange} placeholder="e.g. 165" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input className="input-field" type="number" name="weight_kg" value={hpForm.weight_kg} onChange={onHpChange} placeholder="e.g. 68" />
              </div>
              {healthProfile?.bmi && (
                <div className="sm:col-span-2 rounded-lg bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700">
                  Calculated BMI: <span className="font-semibold">{healthProfile.bmi}</span>
                </div>
              )}
              <div>
                <label className="label">Blood Pressure — systolic</label>
                <input className="input-field" type="number" name="blood_pressure_systolic" value={hpForm.blood_pressure_systolic} onChange={onHpChange} placeholder="e.g. 120" />
              </div>
              <div>
                <label className="label">Blood Pressure — diastolic</label>
                <input className="input-field" type="number" name="blood_pressure_diastolic" value={hpForm.blood_pressure_diastolic} onChange={onHpChange} placeholder="e.g. 80" />
              </div>
              <div>
                <label className="label">Physical Activity</label>
                <select className="input-field" name="physical_activity_level" value={hpForm.physical_activity_level} onChange={onHpChange}>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label">Sleep (hours/night)</label>
                <input className="input-field" type="number" step="0.5" name="sleep_hours" value={hpForm.sleep_hours} onChange={onHpChange} placeholder="e.g. 7" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" name="smoking" checked={hpForm.smoking} onChange={onHpChange} /> Smoking
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" name="alcohol" checked={hpForm.alcohol} onChange={onHpChange} /> Alcohol
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" name="family_history_diabetes" checked={hpForm.family_history_diabetes} onChange={onHpChange} /> Family history of diabetes
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Existing conditions (optional)</label>
                <textarea className="input-field" rows="2" name="existing_conditions" value={hpForm.existing_conditions} onChange={onHpChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Medications (optional)</label>
                <textarea className="input-field" rows="2" name="medications" value={hpForm.medications} onChange={onHpChange} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
