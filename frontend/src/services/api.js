// In Docker, requests go to nginx's same-origin "/api" proxy (VITE_API_URL
// is baked in as "" at build time). For local `npm run dev` without Docker,
// frontend/.env sets VITE_API_URL=http://localhost:8000 (created by setup.bat).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('vsa_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('vsa_token', token)
}

export function clearToken() {
  localStorage.removeItem('vsa_token')
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new Error('Unable to connect to the server.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const message = (data && data.detail) || 'Something went wrong. Please try again.'
    throw new Error(typeof message === 'string' ? message : 'Something went wrong. Please try again.')
  }

  return data
}

async function requestForm(path, formData, { auth = true } = {}) {
  const headers = {}
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  let res
  try {
    res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData })
  } catch {
    throw new Error('Unable to connect to the server.')
  }
  let data = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const message = (data && data.detail) || 'Something went wrong. Please try again.'
    throw new Error(typeof message === 'string' ? message : 'Something went wrong. Please try again.')
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  mlInfo: () => request('/api/ml/info'),

  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/api/auth/logout', { method: 'POST', auth: true }),

  getProfile: () => request('/api/profile', { auth: true }),
  updateProfile: (payload) => request('/api/profile', { method: 'PUT', body: payload, auth: true }),

  getHealthProfile: () => request('/api/health-profile', { auth: true }),
  updateHealthProfile: (payload) => request('/api/health-profile', { method: 'PUT', body: payload, auth: true }),

  predict: (payload) => request('/api/assessment/predict', { method: 'POST', body: payload, auth: true }),
  history: () => request('/api/assessment/history', { auth: true }),
  getAssessment: (id) => request(`/api/assessment/${id}`, { auth: true }),

  addMetric: (payload) => request('/api/metrics', { method: 'POST', body: payload, auth: true }),
  listMetrics: (metricType) => request(`/api/metrics${metricType ? `?metric_type=${metricType}` : ''}`, { auth: true }),

  uploadReport: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestForm('/api/reports/upload', formData)
  },
  listReports: () => request('/api/reports', { auth: true }),
  getReport: (id) => request(`/api/reports/${id}`, { auth: true }),
  addReportMetric: (id, payload) => request(`/api/reports/${id}/metrics`, { method: 'POST', body: payload, auth: true }),
  compareReports: () => request('/api/reports/compare/latest-two', { auth: true }),
}
