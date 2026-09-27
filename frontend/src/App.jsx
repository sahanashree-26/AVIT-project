import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Assessment from './pages/Assessment'
import Result from './pages/Result'
import MyAssessments from './pages/MyAssessments'
import UploadReport from './pages/UploadReport'
import Education from './pages/Education'
import Profile from './pages/Profile'
import About from './pages/About'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/education" element={<Education />} />

          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/my-assessments" element={<ProtectedRoute><MyAssessments /></ProtectedRoute>} />
          <Route path="/upload-report" element={<ProtectedRoute><UploadReport /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
