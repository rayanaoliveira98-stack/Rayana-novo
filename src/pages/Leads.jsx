import { useState } from 'react'
import { Search, Phone, Mail, MessageSquare, ChevronDown } from 'lucide-react'
import Header from '../components/layout/Header'

const all = [
  { id: 1, name: 'Anna Müller', email: 'anna.mueller@gmail.com', phone: '+43 664 111 2233', activity: 'Ballett Anfänger', date: '16. Mai 2026', status: 'neu', note: 'Kind ist 4 Jahre alt, startet gerne im Juni.' },
  { id: 2, name: 'Thomas Bauer', email: 'thomas.bauer@icloud.com', phone: '+43 676 444 5566', activity: 'Kinderfußball U6', date: '15. Mai 2026', status: 'kontaktiert', note: '' },
  { id: 3, name: 'Sandra Pichler', email: 'sandra.p@hotmail.com', phone: '+43 699 777 8899', activity: 'Schwimmen 3–5 J.', date: '13. Mai 2026', status: 'gebucht', note: 'Vertrag per E-Mail verschickt.' },
  { id: 4, name: 'Josef Huber', email: 'j.huber@gmx.at', phone: '+43 650 222 3344', activity: 'Musikzwerge', date: '12. Mai 2026', status: 'kontaktiert', note: 'Wartet auf freien Platz.' },
  { id: 5, name: 'Martina Graf', email: 'martina.graf@web.de', phone: '+43 664 999 0011', activity: 'Ballett Fortgeschritten', date: '11. Mai 2026', status: 'gebucht', note: '' },
  { id: 6, name: 'Peter Schwarz', email: 'p.schwarz@aon.at', phone: '+43 677 333 4455', activity: 'Ballett Anfänger', date: '10. Mai 2026', status: 'kein Interesse', note: 'Schule zu weit entfernt.' },
]

const statusMap = {
  'neu':           { cls: 'badge-green',  label: 'Neu' },
  'kontaktiert':   { cls: 'badge-yellow', label: 'Kontaktiert' },
  'gebucht':       { cls: 'badge-gray',   label: 'Gebucht' },
  'kein Interesse':{ cls: 'badge-red',    label: 'Kein Interesse' },
}

const statuses = Object.keys(statusMap)

export default function Leads() {
  const [leads, setLeads] = useState(all)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('alle')
  const [expanded, setExpanded] = useState(null)

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.activity.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'alle' || l.status === filter
    return matchSearch && matchFilter
  })

  const setStatus = (id, status) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))

  return (
    <div>
      <Header title="Anfragen" subtitle="Verwalten Sie eingehende Leads und Anfragen" />

      <div className="p-8 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Gesamt', count: leads.length, filter: 'alle' },
            { label: 'Neu', count: leads.filter(l => l.status === 'neu').length, filter: 'neu' },
            { label: 'Kontaktiert', count: leads.filter(l => l.status === 'kontaktiert').length, filter: 'kontaktiert' },
            { label: 'Gebucht', count: leads.filter(l => l.status === 'gebucht').length, filter: 'gebucht' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setFilter(s.filter)}
              className={`card p-4 text-left transition-all ${filter === s.filter ? 'ring-2 ring-brand-500' : ''}`}
            >
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search & filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Name oder Aktivität suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="alle">Alle Status</option>
            {statuses.map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}
          </select>
        </div>

        {/* Leads list */}
        <div className="space-y-2">
          {filtered.map(l => (
            <div key={l.id} className="card overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === l.id ? null : l.id)}
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold shrink-0">
                  {l.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{l.name}</p>
                  <p className="text-xs text-gray-500 truncate">{l.activity} · {l.date}</p>
                </div>
                <span className={statusMap[l.status].cls}>{statusMap[l.status].label}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${expanded === l.id ? 'rotate-180' : ''}`}
                />
              </div>

              {expanded === l.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                      <Mail size={14} /> {l.email}
                    </a>
                    <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                      <Phone size={14} /> {l.phone}
                    </a>
                  </div>
                  {l.note && (
                    <p className="flex items-start gap-2 text-xs text-gray-500">
                      <MessageSquare size={13} className="mt-0.5 shrink-0" />
                      {l.note}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-gray-500 font-medium">Status ändern:</span>
                    {statuses.map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(l.id, s)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                          l.status === s
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                        }`}
                      >
                        {statusMap[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="card p-12 text-center text-gray-400">
              <p className="text-sm">Keine Anfragen gefunden.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
