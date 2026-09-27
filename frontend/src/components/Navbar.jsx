import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, clearToken } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">V</span>
          VitalSignAI
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-ink-700 sm:gap-5">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          {loggedIn && <Link to="/assessment" className="hover:text-brand-700">Health Assessment</Link>}
          {loggedIn && <Link to="/upload-report" className="hover:text-brand-700">Upload Report</Link>}
          {loggedIn && <Link to="/my-assessments" className="hover:text-brand-700">My Assessments</Link>}
          <Link to="/education" className="hover:text-brand-700">Health Insights</Link>
          {loggedIn && <Link to="/profile" className="hover:text-brand-700">Profile</Link>}
          <Link to="/about" className="hover:text-brand-700">About</Link>

          {loggedIn ? (
            <button onClick={handleLogout} className="btn-secondary !px-4 !py-1.5">Logout</button>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-1.5">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
