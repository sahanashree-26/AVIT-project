import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.age || !form.gender) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const data = await api.register({ ...form, age: Number(form.age) })
      setToken(data.access_token)
      navigate('/assessment')
    } catch (err) {
      setError(err.message || 'Unable to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-700">Start tracking your early diabetes risk.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input-field" name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 6 characters" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input className="input-field" type="number" name="age" value={form.age} onChange={onChange} placeholder="25" min="1" max="120" />
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
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-700">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700">Login</Link>
        </p>
      </div>
    </div>
  )
}
