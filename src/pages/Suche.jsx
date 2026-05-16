import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Search, MapPin, SlidersHorizontal, Star, Clock,
  Users, Euro, X, Loader2, Check, ChevronDown,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// ─── Mock catalogue ────────────────────────────────────────────────────────────
const LISTINGS = [
  {
    id: '1',
    business: 'Tanzschule Wels',
    activity: 'Ballett Anfänger',
    category: 'Ballett & Tanz',
    emoji: '🩰',
    city: 'Wels',
    age: '3–5 J.',
    day: 'Montag',
    time: '09:00–10:00',
    price: 55,
    spots: 3,
    rating: 4.9,
    reviews: 28,
    description: 'Sanfte Einführung in die Welt des Balletts für die Kleinsten. Freude an Bewegung steht im Mittelpunkt.',
    color: 'from-purple-100 to-pink-100',
    accent: 'bg-purple-500',
  },
  {
    id: '2',
    business: 'Tanzschule Wels',
    activity: 'Ballett Fortgeschritten',
    category: 'Ballett & Tanz',
    emoji: '🩰',
    city: 'Wels',
    age: '6–9 J.',
    day: 'Montag',
    time: '10:30–12:00',
    price: 65,
    spots: 0,
    rating: 4.9,
    reviews: 28,
    description: 'Technische Vertiefung für Kinder mit Vorkenntnissen. Regelmäßige Auftritte bei lokalen Events.',
    color: 'from-purple-100 to-pink-100',
    accent: 'bg-purple-500',
  },
  {
    id: '3',
    business: 'FC Mini Wels',
    activity: 'Kinderfußball U6',
    category: 'Fußball & Sport',
    emoji: '⚽',
    city: 'Wels',
    age: '3–5 J.',
    day: 'Dienstag',
    time: '15:00–16:00',
    price: 45,
    spots: 5,
    rating: 4.7,
    reviews: 41,
    description: 'Spielerisches Erlernen der Grundtechniken. Spaß, Teamgeist und erste Ballkontakte stehen im Vordergrund.',
    color: 'from-green-100 to-emerald-100',
    accent: 'bg-green-500',
  },
  {
    id: '4',
    business: 'Musikzwerge OÖ',
    activity: 'Musikzwerge (0–3 J.)',
    category: 'Musik',
    emoji: '🎵',
    city: 'Wels',
    age: '0–2 J.',
    day: 'Mittwoch',
    time: '10:00–10:45',
    price: 50,
    spots: 0,
    rating: 5.0,
    reviews: 17,
    description: 'Rhythmus, Singen und erste Klänge für Babys und Kleinkinder. Ein magisches Erlebnis für die ganze Familie.',
    color: 'from-yellow-100 to-amber-100',
    accent: 'bg-yellow-500',
  },
  {
    id: '5',
    business: 'AquaKids Linz',
    activity: 'Schwimmen 3–5 J.',
    category: 'Schwimmen',
    emoji: '🏊',
    city: 'Linz',
    age: '3–5 J.',
    day: 'Donnerstag',
    time: '11:00–12:00',
    price: 60,
    spots: 2,
    rating: 4.8,
    reviews: 63,
    description: 'Wassergewöhnung und erste Schwimmtechnik in kleinen Gruppen (max. 6 Kinder). Zertifizierte Trainer.',
    color: 'from-blue-100 to-cyan-100',
    accent: 'bg-blue-500',
  },
  {
    id: '6',
    business: 'LernStudio Linz',
    activity: 'Nachhilfe Grundschule',
    category: 'Nachhilfe',
    emoji: '📚',
    city: 'Linz',
    age: '6–9 J.',
    day: 'Dienstag & Donnerstag',
    time: '14:00–15:00',
    price: 70,
    spots: 4,
    rating: 4.6,
    reviews: 22,
    description: 'Individuelle Förderung in Deutsch und Mathematik. Kleine Gruppen, großer Lernerfolg.',
    color: 'from-orange-100 to-red-100',
    accent: 'bg-orange-500',
  },
  {
    id: '7',
    business: 'KreativWerkstatt Wels',
    activity: 'Kinderkunst 6–10 J.',
    category: 'Kreativität & Kunst',
    emoji: '🎨',
    city: 'Wels',
    age: '6–9 J.',
    day: 'Samstag',
    time: '10:00–12:00',
    price: 55,
    spots: 6,
    rating: 4.8,
    reviews: 19,
    description: 'Malen, Basteln, Skulpturen — Kreativität ohne Grenzen. Jeden Samstag ein neues Kunstprojekt.',
    color: 'from-rose-100 to-pink-100',
    accent: 'bg-rose-500',
  },
  {
    id: '8',
    business: 'BewegungsWelt Linz',
    activity: 'Psychomotorik 2–4 J.',
    category: 'Psychomotorik',
    emoji: '🧠',
    city: 'Linz',
    age: '3–5 J.',
    day: 'Freitag',
    time: '09:30–10:30',
    price: 52,
    spots: 3,
    rating: 4.9,
    reviews: 34,
    description: 'Ganzheitliche Förderung von Wahrnehmung, Motorik und Sozialverhalten durch Bewegung und Spiel.',
    color: 'from-teal-100 to-cyan-100',
    accent: 'bg-teal-500',
  },
  {
    id: '9',
    business: 'SummerCamp OÖ',
    activity: 'Sommer-Camp (Juli)',
    category: 'Sommer-Camps',
    emoji: '🏕️',
    city: 'Wels',
    age: '6–9 J.',
    day: 'Mo–Fr (Ganztag)',
    time: '08:00–17:00',
    price: 280,
    spots: 8,
    rating: 4.7,
    reviews: 56,
    description: 'Eine Woche voller Abenteuer, Sport, Kreativität und neuer Freundschaften. Mittagessen inklusive.',
    color: 'from-lime-100 to-green-100',
    accent: 'bg-lime-500',
  },
]

const CATEGORIES = ['Alle', 'Ballett & Tanz', 'Fußball & Sport', 'Musik', 'Schwimmen', 'Nachhilfe', 'Psychomotorik', 'Kreativität & Kunst', 'Sommer-Camps']
const AGE_GROUPS  = ['Alle', '0–2 J.', '3–5 J.', '6–9 J.', '10–14 J.']
const CITIES      = ['Alle Städte', 'Wels', 'Linz']

// ─── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ listing, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.from('family_inquiries').insert({
      business_id:   listing.id,
      business_name: listing.business,
      activity:      listing.activity,
      parent_name:   form.name,
      email:         form.email,
      phone:         form.phone || null,
      message:       form.message || null,
      children_age:  form.age || null,
    })
    setLoading(false)
    if (err) { setError('Fehler beim Senden. Bitte erneut versuchen.'); return }
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${listing.color} px-6 py-5 flex items-start justify-between`}>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{listing.business}</p>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{listing.activity}</h3>
            <p className="text-xs text-gray-600 mt-1">{listing.day} · {listing.time} · €{listing.price}/Monat</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-white" />
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Anfrage gesendet!</h4>
            <p className="text-sm text-gray-500">{listing.business} meldet sich bald bei Ihnen.</p>
            <button onClick={onClose} className="mt-6 btn-primary mx-auto">Schließen</button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Ihr Name *</label>
                <input className="input" placeholder="Maria Mustermann" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">E-Mail *</label>
                <input className="input" type="email" placeholder="maria@mail.at" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input className="input" type="tel" placeholder="+43 ..." value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Alter des Kindes</label>
                <input className="input" placeholder="z.B. 4 Jahre" value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Nachricht (optional)</label>
                <textarea className="input resize-none" rows={3} placeholder="Fragen, Wünsche…"
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Wird gesendet…</> : 'Anfrage senden'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Activity Card ─────────────────────────────────────────────────────────────
function ActivityCard({ listing, onContact }) {
  const full = listing.spots === 0
  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Visual header */}
      <div className={`bg-gradient-to-br ${listing.color} h-32 flex items-center justify-center relative`}>
        <span className="text-5xl">{listing.emoji}</span>
        {full && (
          <span className="absolute top-3 right-3 badge-red text-xs">Ausgebucht</span>
        )}
        {!full && listing.spots <= 3 && (
          <span className="absolute top-3 right-3 badge-yellow text-xs">Nur {listing.spots} Plätze</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{listing.business}</p>
        <h3 className="text-base font-bold text-gray-900 mt-0.5 mb-1">{listing.activity}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{listing.description}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} className="shrink-0 text-gray-400" />
            {listing.day} · {listing.time}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={12} className="shrink-0 text-gray-400" />
            {listing.age}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={12} className="shrink-0 text-gray-400" />
            {listing.city}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Euro size={12} className="shrink-0 text-gray-400" />
            {listing.price}/Monat
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-gray-700">{listing.rating}</span>
            <span className="text-xs text-gray-400">({listing.reviews})</span>
          </div>
          <button
            onClick={() => onContact(listing)}
            disabled={full}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
              full
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {full ? 'Warteliste' : 'Anfrage senden'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Suche() {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('Alle')
  const [age, setAge]           = useState('Alle')
  const [city, setCity]         = useState('Alle Städte')
  const [selected, setSelected] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const results = useMemo(() => LISTINGS.filter(l => {
    const q = query.toLowerCase()
    const matchQ = !q || l.activity.toLowerCase().includes(q) ||
      l.business.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    const matchCat  = category === 'Alle' || l.category === category
    const matchAge  = age === 'Alle' || l.age === age
    const matchCity = city === 'Alle Städte' || l.city === city
    return matchQ && matchCat && matchAge && matchCity
  }), [query, category, age, city])

  const activeFilters = [category !== 'Alle', age !== 'Alle', city !== 'Alle Städte'].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Star size={14} className="text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">Rayana</span>
          </NavLink>
          <NavLink to="/dashboard" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Partner-Login
          </NavLink>
        </div>
      </nav>

      {/* Search hero */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Aktivitäten für Kinder</h1>
          <p className="text-sm text-gray-500 mb-5">In Wels, Linz und ganz OÖ</p>

          <div className="flex gap-3 flex-wrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9 h-11"
                placeholder="Ballett, Fußball, Musik…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {/* City quick select */}
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                className="input pl-8 h-11 pr-8 w-40 appearance-none"
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`btn-secondary h-11 relative ${showFilters ? 'ring-2 ring-brand-400' : ''}`}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Kategorie</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        category === c
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Altersgruppe</p>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_GROUPS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAge(a)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        age === a
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {(category !== 'Alle' || age !== 'Alle') && (
                <div className="flex items-end">
                  <button
                    onClick={() => { setCategory('Alle'); setAge('Alle') }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X size={12} /> Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{results.length}</span> Angebote gefunden
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-base font-semibold text-gray-900 mb-2">Keine Angebote gefunden</p>
            <p className="text-sm text-gray-500">Versuchen Sie andere Filter oder eine andere Stadt.</p>
            <button
              onClick={() => { setQuery(''); setCategory('Alle'); setAge('Alle'); setCity('Alle Städte') }}
              className="mt-4 btn-secondary"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map(l => (
              <ActivityCard key={l.id} listing={l} onContact={setSelected} />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <ContactModal listing={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
