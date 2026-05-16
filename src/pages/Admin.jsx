import { useEffect, useState, useCallback } from 'react'
import {
  Users, RefreshCw, Search, Mail, Phone,
  ChevronDown, CheckCircle2, Clock, XCircle, Loader2,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { supabase } from '../lib/supabase'

const STATUS = {
  new:        { label: 'Neu',           cls: 'badge-green',  icon: Clock },
  contacted:  { label: 'Kontaktiert',   cls: 'badge-yellow', icon: Clock },
  onboarded:  { label: 'Onboarded',     cls: 'badge-gray',   icon: CheckCircle2 },
  rejected:   { label: 'Abgelehnt',     cls: 'badge-red',    icon: XCircle },
}

const STATUS_KEYS = Object.keys(STATUS)

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

function LeadRow({ lead, onStatusChange }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const changeStatus = async (status) => {
    setSaving(true)
    await onStatusChange(lead.id, status)
    setSaving(false)
  }

  const initials = lead.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const date = new Date(lead.created_at).toLocaleDateString('de-AT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

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
          <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {[lead.category, lead.city].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className={STATUS[lead.status]?.cls ?? 'badge-gray'}>
          {STATUS[lead.status]?.label ?? lead.status}
        </span>
        <p className="text-xs text-gray-400 shrink-0 hidden md:block">{date}</p>
        {saving
          ? <Loader2 size={15} className="text-gray-400 animate-spin shrink-0" />
          : <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </div>

      {open && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors">
              <Mail size={14} className="shrink-0" /> {lead.email}
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors">
                <Phone size={14} className="shrink-0" /> {lead.phone}
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            {STATUS_KEYS.map(s => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={saving}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
                  lead.status === s
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                }`}
              >
                {STATUS[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeads = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('partner_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError('Leads konnten nicht geladen werden. Supabase-Verbindung prüfen.')
    } else {
      setLeads(data ?? [])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id, status) => {
    const { error: err } = await supabase
      .from('partner_leads')
      .update({ status })
      .eq('id', id)
    if (!err) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    }
  }

  const counts = STATUS_KEYS.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {})

  const visible = leads.filter(l => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.category ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || l.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <Header
        title="Partner-Leads Admin"
        subtitle="Alle Registrierungen von der Landing Page"
      />

      <div className="p-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { label: 'Gesamt', count: leads.length, key: 'all', color: 'text-gray-900' },
            { label: 'Neu',          count: counts.new,       key: 'new',       color: 'text-brand-600' },
            { label: 'Kontaktiert',  count: counts.contacted, key: 'contacted', color: 'text-yellow-600' },
            { label: 'Onboarded',    count: counts.onboarded, key: 'onboarded', color: 'text-gray-600' },
            { label: 'Abgelehnt',    count: counts.rejected,  key: 'rejected',  color: 'text-red-500' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`card p-4 text-left transition-all hover:shadow ${filter === s.key ? 'ring-2 ring-brand-500' : ''}`}
            >
              <p className={`text-2xl font-bold ${s.color}`}>
                {loading ? '—' : s.count}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Name, E-Mail, Stadt…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Alle Status</option>
            {STATUS_KEYS.map(s => (
              <option key={s} value={s}>{STATUS[s].label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Leads list */}
        {loading ? (
          <div className="card divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="card p-16 text-center">
            <Users size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {leads.length === 0
                ? 'Noch keine Registrierungen. Teilen Sie die Landing Page!'
                : 'Keine Leads gefunden.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(lead => (
              <LeadRow key={lead.id} lead={lead} onStatusChange={updateStatus} />
            ))}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            {visible.length} von {leads.length} Leads
          </p>
        )}
      </div>
    </div>
  )
}
