import { TrendingUp, Users, Eye, CalendarCheck, ArrowUpRight, ArrowRight } from 'lucide-react'
import Header from '../components/layout/Header'

const stats = [
  {
    label: 'Anfragen diesen Monat',
    value: '24',
    change: '+18%',
    up: true,
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Profilaufrufe',
    value: '1.240',
    change: '+32%',
    up: true,
    icon: Eye,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Buchungen',
    value: '11',
    change: '+5%',
    up: true,
    icon: CalendarCheck,
    color: 'bg-brand-50 text-brand-600',
  },
  {
    label: 'Konversionsrate',
    value: '45,8%',
    change: '-2%',
    up: false,
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-600',
  },
]

const leads = [
  { name: 'Anna Müller', activity: 'Ballett Anfänger', date: 'Heute, 09:14', status: 'neu' },
  { name: 'Thomas Bauer', activity: 'Kinderfußball U6', date: 'Gestern, 17:30', status: 'kontaktiert' },
  { name: 'Sandra Pichler', activity: 'Schwimmen 3–5 J.', date: '13. Mai', status: 'gebucht' },
  { name: 'Josef Huber', activity: 'Musikzwerge', date: '12. Mai', status: 'kontaktiert' },
  { name: 'Martina Graf', activity: 'Ballett Fortgeschritten', date: '11. Mai', status: 'gebucht' },
]

const upcoming = [
  { title: 'Ballett Anfänger', time: 'Mo. 09:00', spots: '3 freie Plätze' },
  { title: 'Kinderfußball U6', time: 'Di. 15:00', spots: '5 freie Plätze' },
  { title: 'Musikzwerge', time: 'Mi. 10:00', spots: 'Ausgebucht' },
  { title: 'Schwimmen 3–5 J.', time: 'Do. 11:00', spots: '2 freie Plätze' },
]

const statusBadge = {
  neu:          'badge-green',
  kontaktiert:  'badge-yellow',
  gebucht:      'badge-gray',
}

export default function Dashboard() {
  return (
    <div>
      <Header
        title="Übersicht"
        subtitle="Willkommen zurück, Tanzschule Wels!"
      />

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${s.up ? 'text-brand-600' : 'text-red-500'}`}>
                    <ArrowUpRight size={12} className={s.up ? '' : 'rotate-180'} />
                    {s.change} vs. letzten Monat
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.color}`}>
                  <s.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent leads */}
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Letzte Anfragen</h2>
              <a href="/leads" className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
                Alle ansehen <ArrowRight size={12} />
              </a>
            </div>
            <div className="divide-y divide-gray-50">
              {leads.map((l) => (
                <div key={l.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                      {l.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.name}</p>
                      <p className="text-xs text-gray-500">{l.activity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={statusBadge[l.status]}>{l.status}</span>
                    <p className="text-xs text-gray-400 mt-1">{l.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming schedule */}
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Diese Woche</h2>
              <a href="/schedule" className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
                Kalender <ArrowRight size={12} />
              </a>
            </div>
            <div className="divide-y divide-gray-50">
              {upcoming.map((u) => (
                <div key={u.title} className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.time}</p>
                    </div>
                    <span className={u.spots === 'Ausgebucht' ? 'badge-red' : 'badge-green'}>
                      {u.spots}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium upsell banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Mehr Sichtbarkeit mit Premium</p>
            <p className="text-brand-100 text-sm mt-1">
              Erscheine ganz oben in der Suche, in unserem Newsletter und auf Instagram.
            </p>
          </div>
          <a
            href="/settings"
            className="shrink-0 px-5 py-2.5 bg-white text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Premium aktivieren
          </a>
        </div>
      </div>
    </div>
  )
}
