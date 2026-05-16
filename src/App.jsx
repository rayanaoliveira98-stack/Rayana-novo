import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Suche from './pages/Suche'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Activities from './pages/Activities'
import Leads from './pages/Leads'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

function PrivateLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Landing />} />
          <Route path="/suche"  element={<Suche />} />
          <Route path="/login"  element={<Login />} />

          {/* Protected partner dashboard */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/leads"      element={<Leads />} />
            <Route path="/schedule"   element={<Schedule />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="/admin"      element={<Admin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
