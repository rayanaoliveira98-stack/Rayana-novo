import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '../components/layout/Header'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
]

const events = {
  '2026-05-18': [{ title: 'Ballett Anfänger', time: '09:00', color: 'bg-purple-100 text-purple-700 border-purple-200' }],
  '2026-05-18b': [{ title: 'Ballett Fortgeschritten', time: '10:30', color: 'bg-purple-100 text-purple-700 border-purple-200' }],
  '2026-05-19': [{ title: 'Kinderfußball U6', time: '15:00', color: 'bg-green-100 text-green-700 border-green-200' }],
  '2026-05-20': [{ title: 'Musikzwerge', time: '10:00', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }],
  '2026-05-21': [{ title: 'Schwimmen 3–5 J.', time: '11:00', color: 'bg-blue-100 text-blue-700 border-blue-200' }],
  '2026-05-25': [{ title: 'Ballett Anfänger', time: '09:00', color: 'bg-purple-100 text-purple-700 border-purple-200' }],
  '2026-05-26': [{ title: 'Kinderfußball U6', time: '15:00', color: 'bg-green-100 text-green-700 border-green-200' }],
  '2026-05-27': [{ title: 'Musikzwerge', time: '10:00', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }],
  '2026-05-28': [{ title: 'Schwimmen 3–5 J.', time: '11:00', color: 'bg-blue-100 text-blue-700 border-blue-200' }],
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export default function Schedule() {
  const today = new Date(2026, 4, 16)
  const [view, setView] = useState({ year: 2026, month: 4 })

  const prev = () => setView(v => {
    const d = new Date(v.year, v.month - 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const next = () => setView(v => {
    const d = new Date(v.year, v.month + 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const daysInMonth = getDaysInMonth(view.year, view.month)
  const firstDay = getFirstDayOfMonth(view.year, view.month)
  const cells = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  const getKey = (day) =>
    `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isToday = (day) =>
    day === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear()

  const upcomingList = [
    { day: 'Mo, 18. Mai', items: [
      { title: 'Ballett Anfänger', time: '09:00–10:00', spots: '3 frei', color: 'bg-purple-500' },
      { title: 'Ballett Fortgeschritten', time: '10:30–12:00', spots: 'Ausgebucht', color: 'bg-purple-500' },
    ]},
    { day: 'Di, 19. Mai', items: [
      { title: 'Kinderfußball U6', time: '15:00–16:00', spots: '5 frei', color: 'bg-green-500' },
    ]},
    { day: 'Mi, 20. Mai', items: [
      { title: 'Musikzwerge', time: '10:00–10:45', spots: 'Ausgebucht', color: 'bg-yellow-500' },
    ]},
    { day: 'Do, 21. Mai', items: [
      { title: 'Schwimmen 3–5 J.', time: '11:00–12:00', spots: '2 frei', color: 'bg-blue-500' },
    ]},
  ]

  return (
    <div>
      <Header title="Kalender" subtitle="Übersicht Ihrer Kurstermine" />

      <div className="p-8 flex gap-6 flex-col xl:flex-row">
        {/* Calendar */}
        <div className="card p-6 flex-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              {MONTHS[view.month]} {view.year}
            </h2>
            <div className="flex gap-1">
              <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
            {cells.map((day, i) => {
              const key = day ? getKey(day) : null
              const evts = key ? (events[key] || []) : []
              return (
                <div
                  key={i}
                  className={`min-h-[72px] p-1.5 rounded-lg ${
                    day ? 'hover:bg-gray-50 cursor-pointer' : ''
                  } ${isToday(day) ? 'bg-brand-50 ring-1 ring-brand-400' : ''}`}
                >
                  {day && (
                    <>
                      <p className={`text-xs font-medium mb-1 ${
                        isToday(day) ? 'text-brand-700' : 'text-gray-700'
                      }`}>{day}</p>
                      {evts.map((e, j) => (
                        <div key={j} className={`text-xs px-1.5 py-0.5 rounded border mb-0.5 truncate ${e.color}`}>
                          {e.time} {e.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="card p-6 w-full xl:w-72 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Nächste Termine</h2>
          <div className="space-y-4">
            {upcomingList.map(group => (
              <div key={group.day}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.day}</p>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <div key={item.title} className="flex items-start gap-2.5">
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${item.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                        <span className={item.spots === 'Ausgebucht' ? 'badge-red mt-1' : 'badge-green mt-1'}>
                          {item.spots}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
