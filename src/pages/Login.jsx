import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Star, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // Already logged in → redirect immediately
  useEffect(() => {
    if (session) navigate(from, { replace: true })
  }, [session, navigate, from])

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort falsch.'
          : 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
      )
    }
    // On success, onAuthStateChange fires → useEffect above redirects
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
          <Star size={20} className="text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Rayana</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm p-8">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Partner-Login</h1>
        <p className="text-sm text-gray-500 mb-6">Melden Sie sich bei Ihrem Dashboard an.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">E-Mail-Adresse</label>
            <input
              className="input"
              type="email"
              placeholder="info@ihrestudio.at"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Passwort</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Anmelden…</>
              : 'Anmelden'
            }
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400">
          Noch kein Konto?{' '}
          <a href="/#registrieren" className="text-brand-600 hover:underline font-medium">
            Jetzt registrieren
          </a>
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Rayana · Alle Rechte vorbehalten
      </p>
    </div>
  )
}
