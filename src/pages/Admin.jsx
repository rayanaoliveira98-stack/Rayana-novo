import { useEffect, useState, useCallback } from 'react'
import {
  Users, Building2, RefreshCw, Search,
  Mail, Phone, ChevronDown, CheckCircle2,
  Clock, XCircle, Loader2, MessageSquare,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { supabase } from '../lib/supabase'

// ─── Shared status config ──────────────────────────────────────────────────────
const PARTNER_STATUS = {
  new:        { label: 'Neu',         cls: 'badge-green'  },
  contacted:  { label: 'Kontaktiert', cls: 'badge-yellow' },
  onboarded:  { label: 'Onboarded',   cls: 'badge-gray'   },
  rejected:   { label: 'Abgelehnt',   cls: 'badge-red'    },
}

const INQUIRY_STATUS = {
  new:        { label: 'Neu',         cls: 'badge-green'  },
  contacted:  { label: 'Kontaktiert', cls: 'badge-yellow' },
  closed:     { label: 'Erledigt',    cls: 'badge-gray'   },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-56" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-20" />
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  )
}

// ─── Generic expandable row ────────────────────────────────────────────────────
function LeadRow({ initials, title, subtitle, date, status, statusMap, onStatusChange, children }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const change = async (s) => {
    setSaving(true)
    await onStatusChange(s)
    setSaving(false)
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
        <span className={statusMap[status]?.cls ?? 'badge-gray'}>
          {statusMap[status]?.label ?? status}
        </span>
        <p className="text-xs text-gray-400 shrink-0 hidden md:block">{date}</p>
        {saving
          ? <Loader2 size={15} className="text-gray-400 animate-spin shrink-0" />
          : <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </div>

      {open && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-3">
          {children}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            {Object.entries(statusMap).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => change(key)}
                disabled={saving}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
                  status === key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ items, filter, setFilter, loading }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(s => (
        <button
          key={s.key}
          onClick={() => setFilter(s.key)}
          className={`card p-4 text-left transition-all hover:shadow ${filter === s.key ? 'ring-2 ring-brand-500' : ''}`}
        >
          <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.count}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Partner Leads tab ────────────────────────────────────────────────────────
function PartnerLeadsTab() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const fetch_ = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('partner_leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError('Verbindungsfehler. Supabase prüfen.')
    else setRows(data ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const updateStatus = async (id, status) => {
    const { error: err } = await supabase.from('partner_leads').update({ status }).eq('id', id)
    if (!err) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const counts = Object.keys(PARTNER_STATUS).reduce((a, k) => ({ ...a, [k]: rows.filter(r => r.status === k).length }), {})

  const visible = rows.filter(r => {
    const q = search.toLowerCase()
    return (
      (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) ||
        (r.city ?? '').toLowerCase().includes(q) || (r.category ?? '').toLowerCase().includes(q)) &&
      (filter === 'all' || r.status === filter)
    )
  })

  const fmt = ts => new Date(ts).toLocaleDateString('de-AT', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-5">
      <StatsBar
        filter={filter} setFilter={setFilter} loading={loading}
        items={[
          { key: 'all',       label: 'Gesamt',      count: rows.length,         color: 'text-gray-900'   },
          { key: 'new',       label: 'Neu',          count: counts.new,          color: 'text-brand-600'  },
          { key: 'contacted', label: 'Kontaktiert',  count: counts.contacted,    color: 'text-yellow-600' },
          { key: 'onboarded', label: 'Onboarded',    count: counts.onboarded,    color: 'text-gray-600'   },
          { key: 'rejected',  label: 'Abgelehnt',    count: counts.rejected,     color: 'text-red-500'    },
        ]}
      />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Name, E-Mail, Stadt…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Alle Status</option>
          {Object.entries(PARTNER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => fetch_(true)} disabled={refreshing} className="btn-secondary">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Aktualisieren
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="card divide-y divide-gray-50">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : visible.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{rows.length === 0 ? 'Noch keine Registrierungen.' : 'Keine Leads gefunden.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(r => (
            <LeadRow
              key={r.id}
              initials={r.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
              title={r.name}
              subtitle={[r.category, r.city].filter(Boolean).join(' · ')}
              date={fmt(r.created_at)}
              status={r.status}
              statusMap={PARTNER_STATUS}
              onStatusChange={s => updateStatus(r.id, s)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                  <Mail size={14} /> {r.email}
                </a>
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                    <Phone size={14} /> {r.phone}
                  </a>
                )}
              </div>
            </LeadRow>
          ))}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{visible.length} von {rows.length} Leads</p>
      )}
    </div>
  )
}

// ─── Family Inquiries tab ─────────────────────────────────────────────────────
function FamilyInquiriesTab() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const fetch_ = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('family_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError('Verbindungsfehler. Supabase prüfen.')
    else setRows(data ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const updateStatus = async (id, status) => {
    const { error: err } = await supabase.from('family_inquiries').update({ status }).eq('id', id)
    if (!err) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const counts = Object.keys(INQUIRY_STATUS).reduce((a, k) => ({ ...a, [k]: rows.filter(r => r.status === k).length }), {})

  const visible = rows.filter(r => {
    const q = search.toLowerCase()
    return (
      (!q || r.parent_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) ||
        r.business_name.toLowerCase().includes(q) || r.activity.toLowerCase().includes(q)) &&
      (filter === 'all' || r.status === filter)
    )
  })

  const fmt = ts => new Date(ts).toLocaleDateString('de-AT', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-5">
      <StatsBar
        filter={filter} setFilter={setFilter} loading={loading}
        items={[
          { key: 'all',      label: 'Gesamt',     count: rows.length,      color: 'text-gray-900'   },
          { key: 'new',      label: 'Neu',         count: counts.new,       color: 'text-brand-600'  },
          { key: 'contacted',label: 'Kontaktiert', count: counts.contacted, color: 'text-yellow-600' },
          { key: 'closed',   label: 'Erledigt',    count: counts.closed,    color: 'text-gray-600'   },
        ]}
      />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Name, Aktivität, Studio…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Alle Status</option>
          {Object.entries(INQUIRY_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => fetch_(true)} disabled={refreshing} className="btn-secondary">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Aktualisieren
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="card divide-y divide-gray-50">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : visible.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{rows.length === 0 ? 'Noch keine Familienanfragen.' : 'Keine Anfragen gefunden.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(r => (
            <LeadRow
              key={r.id}
              initials={r.parent_name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
              title={r.parent_name}
              subtitle={`${r.activity} · ${r.business_name}`}
              date={fmt(r.created_at)}
              status={r.status}
              statusMap={INQUIRY_STATUS}
              onStatusChange={s => updateStatus(r.id, s)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                  <Mail size={14} /> {r.email}
                </a>
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                    <Phone size={14} /> {r.phone}
                  </a>
                )}
              </div>
              {r.children_age && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Users size={12} /> Kind: {r.children_age}
                </p>
              )}
              {r.message && (
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <MessageSquare size={12} className="mt-0.5 shrink-0" /> {r.message}
                </p>
              )}
            </LeadRow>
          ))}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{visible.length} von {rows.length} Anfragen</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'partners',  label: 'Partner-Leads',    icon: Building2 },
  { key: 'families',  label: 'Familienanfragen', icon: Users     },
]

export default function Admin() {
  const [tab, setTab] = useState('partners')

  return (
    <div>
      <Header title="Admin" subtitle="Partner-Registrierungen und Familienanfragen verwalten" />

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {tab === 'partners' ? <PartnerLeadsTab /> : <FamilyInquiriesTab />}
      </div>
    </div>
  )
}
