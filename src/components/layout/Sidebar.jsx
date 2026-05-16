import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  Users,
  Clock,
  Settings,
  Star,
} from 'lucide-react'

const nav = [
  { to: '/dashboard',   label: 'Übersicht',    icon: LayoutDashboard },
  { to: '/profile',     label: 'Mein Profil',  icon: UserCircle },
  { to: '/activities',  label: 'Aktivitäten',  icon: CalendarDays },
  { to: '/leads',       label: 'Anfragen',     icon: Users },
  { to: '/schedule',    label: 'Kalender',     icon: Clock },
  { to: '/settings',   label: 'Plan & Abo',   icon: Settings },
]

export default function Sidebar() {
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
      </nav>

      {/* Partner info */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
            TS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Tanzschule Wels</p>
            <p className="text-xs text-gray-500 truncate">Premium Partner</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
