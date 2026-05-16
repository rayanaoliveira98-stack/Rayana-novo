import { useState } from 'react'
import { Check, Zap, Star, Crown } from 'lucide-react'
import Header from '../components/layout/Header'

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    icon: Star,
    price: 0,
    period: 'kostenlos',
    description: 'Zum Starten ohne Risiko.',
    features: [
      'Basisprofil auf Rayana',
      'Bis zu 2 Aktivitäten listen',
      'Sichtbar in der Suche',
      'Anfragen erhalten',
    ],
    missing: [
      'Kein Topplatzierung',
      'Kein Newsletter-Feature',
      'Kein Instagram-Highlight',
      'Keine Push-Benachrichtigungen',
    ],
    cta: 'Aktueller Plan',
    current: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Zap,
    price: 49,
    period: '/Monat',
    description: 'Für aktive Partner, die mehr Anfragen möchten.',
    features: [
      'Alle Gratis-Features',
      'Topplatzierung in der Suche',
      'Highlight auf Instagram',
      'Newsletter-Feature',
      'Push-Benachrichtigungen',
      'Unbegrenzte Aktivitäten',
      'Prioritäts-Leads',
      'Saisonkampagnen (Sommer/Winter)',
    ],
    missing: [],
    cta: 'Auf Premium upgraden',
    current: false,
    highlight: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    price: 99,
    period: '/Monat',
    description: 'Für Studios die maximale Sichtbarkeit wollen.',
    features: [
      'Alle Premium-Features',
      'Buchungs-Integration',
      'Vorrangiger Kundensupport',
      'Monatliche Performance-Reports',
      'Dedizierter Account Manager',
      'Werbeanzeigen-Budget inkl. (€50/Monat)',
    ],
    missing: [],
    cta: 'Auf Pro upgraden',
    current: false,
  },
]

const notifications = [
  { id: 'new_lead',    label: 'Neue Anfrage',               on: true },
  { id: 'booking',    label: 'Neue Buchung',                on: true },
  { id: 'newsletter', label: 'Newsletter-Highlights',       on: false },
  { id: 'weekly',     label: 'Wöchentliche Zusammenfassung', on: true },
  { id: 'promo',      label: 'Saisonale Kampagnen',         on: false },
]

export default function Settings() {
  const [notifs, setNotifs] = useState(notifications)

  const toggle = (id) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, on: !n.on } : n))

  return (
    <div>
      <Header title="Plan & Einstellungen" subtitle="Abonnement verwalten und Benachrichtigungen konfigurieren" />

      <div className="p-8 space-y-8 max-w-5xl">
        {/* Plans */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Abonnement wählen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`card p-6 flex flex-col relative ${
                  plan.highlight
                    ? 'ring-2 ring-brand-500 shadow-md'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Empfohlen
                    </span>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  plan.highlight ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <plan.icon size={20} />
                </div>

                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5 mb-3">{plan.description}</p>

                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-sm text-gray-500 pb-1">{plan.period}</span>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-brand-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <Check size={14} className="text-gray-300 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={plan.current}
                  className={`mt-5 w-full py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    plan.current
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : plan.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Benachrichtigungen</h2>
          <p className="text-xs text-gray-500 mb-4">Wählen Sie, worüber Sie per E-Mail informiert werden möchten.</p>
          <div className="space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{n.label}</span>
                <button
                  onClick={() => toggle(n.id)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${n.on ? 'bg-brand-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      n.on ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-6 border-red-100">
          <h2 className="text-sm font-semibold text-red-600 mb-1">Konto</h2>
          <p className="text-xs text-gray-500 mb-4">Diese Aktionen können nicht rückgängig gemacht werden.</p>
          <div className="flex gap-3">
            <button className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
              Partnerschaft kündigen
            </button>
            <button className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
              Konto löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
