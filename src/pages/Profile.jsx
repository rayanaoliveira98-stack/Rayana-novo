import { useState } from 'react'
import { Camera, MapPin, Globe, Phone, Mail, Save } from 'lucide-react'
import Header from '../components/layout/Header'

const categories = [
  'Ballett & Tanz',
  'Fußball & Sport',
  'Musik',
  'Schwimmen',
  'Psychomotorik',
  'Nachhilfe',
  'Therapie',
  'Sommer-Camps',
  'Kreativität & Kunst',
  'Yoga & Entspannung',
]

const ageGroups = ['0–2 J.', '3–5 J.', '6–9 J.', '10–14 J.', '14+ J.']

export default function Profile() {
  const [form, setForm] = useState({
    name: 'Tanzschule Wels',
    category: 'Ballett & Tanz',
    description: 'Wir bieten professionellen Tanzunterricht für Kinder ab 3 Jahren in Wels und Umgebung. Unsere erfahrenen Lehrerinnen begleiten Ihre Kinder mit Freude und Leidenschaft.',
    address: 'Stadtplatz 12, 4600 Wels',
    website: 'www.tanzschule-wels.at',
    phone: '+43 7242 123456',
    email: 'info@tanzschule-wels.at',
    ages: ['3–5 J.', '6–9 J.', '10–14 J.'],
    priceFrom: '45',
    priceTo: '65',
  })

  const [saved, setSaved] = useState(false)

  const toggle = (arr, val) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Header title="Mein Profil" subtitle="Verwalten Sie Ihre öffentliche Seite auf Rayana" />

      <div className="p-8 max-w-3xl space-y-6">
        {/* Cover photo */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Fotos & Logo</h2>
          <div className="relative h-40 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl flex items-center justify-center">
            <button className="flex flex-col items-center gap-2 text-brand-600 hover:text-brand-700">
              <Camera size={24} />
              <span className="text-xs font-medium">Titelbild hochladen</span>
            </button>
            <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl border-4 border-white bg-brand-600 flex items-center justify-center shadow-sm">
              <button className="absolute inset-0 flex items-center justify-center">
                <Camera size={16} className="text-white" />
              </button>
            </div>
          </div>
          <div className="mt-10">
            <p className="text-xs text-gray-500">Logo empfohlen: 400×400 px · max. 2 MB</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Allgemeine Informationen</h2>

          <div>
            <label className="label">Name des Unternehmens</label>
            <input
              className="input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Kategorie</label>
            <select
              className="input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Beschreibung</label>
            <textarea
              className="input resize-none"
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 Zeichen</p>
          </div>

          <div>
            <label className="label">Altersgruppen</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ageGroups.map(a => (
                <button
                  key={a}
                  onClick={() => setForm(f => ({ ...f, ages: toggle(f.ages, a) }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    form.ages.includes(a)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Preis ab (€/Monat)</label>
              <input
                className="input"
                type="number"
                value={form.priceFrom}
                onChange={e => setForm(f => ({ ...f, priceFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Preis bis (€/Monat)</label>
              <input
                className="input"
                type="number"
                value={form.priceTo}
                onChange={e => setForm(f => ({ ...f, priceTo: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Kontaktdaten</h2>

          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Adresse"
            />
          </div>
          <div className="relative">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="Website"
            />
          </div>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Telefon"
            />
          </div>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="E-Mail"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="btn-primary">
            <Save size={15} />
            {saved ? 'Gespeichert!' : 'Änderungen speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
