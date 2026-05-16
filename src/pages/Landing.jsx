import { useState } from 'react'
import {
  Star, Check, ArrowRight, MapPin, Users, TrendingUp,
  Zap, Instagram, Mail, ChevronDown, Menu, X, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const categories = [
  { emoji: '🩰', label: 'Ballett & Tanz' },
  { emoji: '⚽', label: 'Fußball & Sport' },
  { emoji: '🎵', label: 'Musik' },
  { emoji: '🏊', label: 'Schwimmen' },
  { emoji: '🧠', label: 'Psychomotorik' },
  { emoji: '📚', label: 'Nachhilfe' },
  { emoji: '🏕️', label: 'Sommer-Camps' },
  { emoji: '🎨', label: 'Kreativität' },
  { emoji: '🧘', label: 'Yoga & Bewegung' },
  { emoji: '🩺', label: 'Therapie' },
]

const steps = [
  {
    n: '01',
    title: 'Profil erstellen',
    body: 'Kostenlos registrieren und Ihre Aktivitäten eintragen. In 10 Minuten online.',
  },
  {
    n: '02',
    title: 'Familien entdecken Sie',
    body: 'Eltern in Ihrer Stadt suchen auf Rayana nach Angeboten für ihre Kinder.',
  },
  {
    n: '03',
    title: 'Anfragen direkt erhalten',
    body: 'Interessierte Familien kontaktieren Sie direkt — Sie füllen Ihre freien Plätze.',
  },
]

const benefits = [
  {
    icon: MapPin,
    title: 'Lokale Sichtbarkeit',
    body: 'Erscheinen Sie genau dort, wo Familien in Ihrer Stadt nach Aktivitäten suchen.',
  },
  {
    icon: Users,
    title: 'Echte Anfragen',
    body: 'Kein allgemeines Marketing — Eltern, die aktiv einen Platz suchen, finden Sie.',
  },
  {
    icon: TrendingUp,
    title: 'Volle Kurse',
    body: 'Reduzieren Sie Leerstunden und füllen Sie Ihren Kalender schneller.',
  },
  {
    icon: Instagram,
    title: 'Social Media Boost',
    body: 'Premium-Partner werden auf unserem lokalen Instagram und Newsletter hervorgehoben.',
  },
]

const plans = [
  {
    name: 'Gratis',
    price: 0,
    period: 'kostenlos',
    features: ['Basisprofil', 'Bis zu 2 Aktivitäten', 'Sichtbar in der Suche', 'Anfragen erhalten'],
    cta: 'Jetzt kostenlos starten',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 49,
    period: '/Monat',
    features: [
      'Unbegrenzte Aktivitäten',
      'Topplatzierung in der Suche',
      'Instagram-Highlight',
      'Newsletter-Feature',
      'Push-Benachrichtigungen',
      'Saisonkampagnen',
    ],
    cta: 'Premium starten',
    highlight: true,
    badge: 'Empfohlen',
  },
  {
    name: 'Pro',
    price: 99,
    period: '/Monat',
    features: [
      'Alles aus Premium',
      'Buchungs-Integration',
      'Performance-Reports',
      'Account Manager',
      '€50 Werbebudget inkl.',
    ],
    cta: 'Pro starten',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Wie schnell bin ich online?',
    a: 'Nach der Registrierung können Sie Ihr Profil in unter 10 Minuten einrichten. Ihr Angebot ist sofort für Familien sichtbar.',
  },
  {
    q: 'Muss ich sofort bezahlen?',
    a: 'Nein. Das Gratis-Profil ist dauerhaft kostenlos. Sie können jederzeit auf Premium oder Pro upgraden.',
  },
  {
    q: 'In welchen Städten ist Rayana verfügbar?',
    a: 'Wir starten in Wels und Linz (OÖ) und erweitern schrittweise auf ganz Österreich.',
  },
  {
    q: 'Wie erhalte ich Anfragen von Familien?',
    a: 'Interessierte Eltern klicken auf Ihr Profil und senden direkt eine Anfrage. Sie erhalten eine E-Mail-Benachrichtigung und können im Dashboard antworten.',
  },
  {
    q: 'Kann ich mein Profil jederzeit anpassen?',
    a: 'Ja. Aktivitäten, Preise, Fotos und Kontaktdaten können Sie jederzeit im Partner-Dashboard ändern.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', category: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.from('partner_leads').insert({
      name:     form.name,
      city:     form.city || null,
      category: form.category || null,
      email:    form.email,
      phone:    form.phone || null,
    })
    setLoading(false)
    if (err) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-white fill-white" />
            </div>
            <span className="text-base font-bold">Rayana</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#wie-es-funktioniert" className="hover:text-gray-900 transition-colors">So funktioniert's</a>
            <a href="#preise" className="hover:text-gray-900 transition-colors">Preise</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Partner-Login
            </a>
            <a
              href="#registrieren"
              className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              Kostenlos starten
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3">
            <a href="#wie-es-funktioniert" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>So funktioniert's</a>
            <a href="#preise" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Preise</a>
            <a href="#faq" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#registrieren" className="block btn-primary justify-center" onClick={() => setMenuOpen(false)}>Kostenlos starten</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <MapPin size={12} /> Jetzt in Wels & Linz gestartet
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Neue Familien für Ihr<br />
          <span className="text-brand-600">Kinderangebot</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Rayana bringt Eltern in Ihrer Stadt direkt zu Ihnen.
          Ballett, Fußball, Schwimmen, Musik — sichtbar dort, wo Familien suchen.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#registrieren"
            className="px-6 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            Kostenlos als Partner registrieren <ArrowRight size={16} />
          </a>
          <a
            href="#wie-es-funktioniert"
            className="px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Mehr erfahren
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-400">Keine Kreditkarte · Immer kostenlos startbar</p>

        {/* Category chips */}
        <div className="mt-14 flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <span key={c.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-brand-600">
        <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-3 gap-8 text-center">
          {[
            { n: '500+', label: 'Familien in OÖ' },
            { n: '40+', label: 'Partnerbetriebe' },
            { n: '⌀ 18', label: 'Anfragen/Monat' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white">{s.n}</p>
              <p className="text-brand-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="wie-es-funktioniert" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">So einfach geht's</p>
          <h2 className="text-3xl font-bold text-gray-900">In 3 Schritten zu mehr Buchungen</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-black text-brand-100 mb-3">{s.n}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Warum Rayana</p>
            <h2 className="text-3xl font-bold text-gray-900">Gebaut für lokale Kinderangebote</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto text-sm">
              Kein großes Marketing-Budget nötig. Rayana übernimmt die Sichtbarkeit — Sie kümmern sich um die Kinder.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <b.icon size={20} className="text-brand-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target businesses */}
      <section className="max-w-6xl mx-auto px-5 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Für wen ist Rayana?</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfekt für kleine Studios mit großer Leidenschaft
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Große Schulen haben Marketing-Teams. Kleine Studios haben Instagram — und jetzt Rayana.
              Wir geben Ihrem Angebot die Sichtbarkeit, die es verdient.
            </p>
            <ul className="space-y-3">
              {[
                'Tanzschulen & Ballettstudios',
                'Fußball- & Sportvereine',
                'Musikschulen & Musikzwerge',
                'Schwimmschulen',
                'Nachhilfe & Lernstudios',
                'Therapeuten & Ergotherapeuten',
                'Sommer- & Feriencamps',
                'Kreativ- & Kunststudios',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check size={15} className="text-brand-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl p-8 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Anfrage erhalten</p>
              <p className="text-sm font-semibold text-gray-900">Anna M. interessiert sich für</p>
              <p className="text-sm text-brand-600 font-medium">Ballett Anfänger · 4 Jahre</p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg">Antworten</button>
                <button className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">Profil</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-2">Diese Woche</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Profilaufrufe</span>
                <span className="text-sm font-bold text-brand-600">+127</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-700">Neue Anfragen</span>
                <span className="text-sm font-bold text-brand-600">+8</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-700">Buchungen</span>
                <span className="text-sm font-bold text-brand-600">+3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Transparente Preise</p>
            <h2 className="text-3xl font-bold text-gray-900">Fangen Sie kostenlos an</h2>
            <p className="mt-3 text-gray-500 text-sm">Upgraden Sie jederzeit — ohne Vertragsbindung.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map(p => (
              <div
                key={p.name}
                className={`bg-white rounded-2xl p-6 border relative flex flex-col ${
                  p.highlight ? 'border-brand-500 shadow-lg' : 'border-gray-100'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{p.badge}</span>
                  </div>
                )}
                <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                <div className="flex items-end gap-1 my-4">
                  <span className="text-4xl font-black text-gray-900">€{p.price}</span>
                  <span className="text-sm text-gray-500 pb-1">{p.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-brand-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#registrieren"
                  className={`mt-6 block text-center py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    p.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register form */}
      <section id="registrieren" className="max-w-6xl mx-auto px-5 py-24">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Gründungspartner</p>
            <h2 className="text-3xl font-bold text-gray-900">Jetzt kostenlos registrieren</h2>
            <p className="mt-3 text-gray-500 text-sm">
              Die ersten 50 Partner erhalten lebenslang kostenlosen Premium-Zugang.
            </p>
          </div>

          {submitted ? (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Vielen Dank!</h3>
              <p className="text-sm text-gray-600">
                Wir melden uns innerhalb von 24 Stunden bei Ihnen. Willkommen bei Rayana!
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div>
                <label className="label">Name Ihres Unternehmens *</label>
                <input
                  className="input"
                  placeholder="z.B. Tanzschule Wels"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Stadt</label>
                  <input
                    className="input"
                    placeholder="z.B. Wels"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Kategorie</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Bitte wählen</option>
                    {categories.map(c => (
                      <option key={c.label}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">E-Mail-Adresse *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="info@ihrestudio.at"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Telefon (optional)</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="+43 ..."
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Wird gesendet…</>
                  : <>Kostenlos registrieren <ArrowRight size={16} /></>
                }
              </button>
              <p className="text-xs text-center text-gray-400">
                Kein Spam. Keine Kreditkarte. Jederzeit kündbar.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 py-24">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Häufige Fragen</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-2">
            {faqs.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-600 py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit, Ihren Kalender zu füllen?
          </h2>
          <p className="text-brand-200 text-sm mb-8">
            Starten Sie kostenlos und holen Sie sich Ihre ersten Familien noch diesen Monat.
          </p>
          <a
            href="#registrieren"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-colors text-sm"
          >
            Jetzt Partner werden <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <Star size={14} className="text-white fill-white" />
              </div>
              <span className="text-white font-bold text-sm">Rayana</span>
            </div>
            <p className="text-xs">Die lokale Plattform für Kinderaktivitäten in OÖ.</p>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Partner-Login</a>
          </div>
          <div className="flex gap-3">
            <a href="#" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
              <Instagram size={14} /> @rayana.at
            </a>
            <a href="mailto:hallo@rayana.at" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
              <Mail size={14} /> hallo@rayana.at
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
