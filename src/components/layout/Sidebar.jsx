import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UserCircle, CalendarDays,
  Users, Clock, Settings, Star, ShieldCheck, LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const nav = [
  { to: '/dashboard',  label: 'Übersicht',   icon: LayoutDashboard },
  { to: '/profile',    label: 'Mein Profil', icon: UserCircle },
  { to: '/activities', label: 'Aktivitäten', icon: CalendarDays },
  { to: '/leads',      label: 'Anfragen',    icon: Users },
  { to: '/schedule',   label: 'Kalender',    icon: Clock },
  { to: '/settings',   label: 'Plan & Abo',  icon: Settings },
]

const adminNav = [
  { to: '/admin', label: 'Partner-Leads', icon: ShieldCheck },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Star size={16} className="text-white fill-white" />
        </div>
        <span className="text-base font-bold text-gray-900">Rayana</span>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Partner</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Admin</p>
          {adminNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.email ?? '—'}</p>
            <p className="text-xs text-gray-400">Partner</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="nav-link nav-link-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
