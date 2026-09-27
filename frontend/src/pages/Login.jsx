import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const data = await api.login(form)
      setToken(data.access_token)
      navigate('/assessment')
    } catch (err) {
      setError(err.message === 'Invalid email or password.' ? err.message : (err.message || 'Invalid email or password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-700">Log in to continue your health assessments.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-700">
          Don't have an account? <Link to="/register" className="font-semibold text-brand-700">Register</Link>
        </p>
      </div>
    </div>
  )
}
