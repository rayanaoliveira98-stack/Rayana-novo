import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Clock, Euro } from 'lucide-react'
import Header from '../components/layout/Header'

const initial = [
  {
    id: 1,
    title: 'Ballett Anfänger',
    age: '3–5 J.',
    day: 'Montag',
    time: '09:00–10:00',
    spots: 12,
    booked: 9,
    price: 55,
    active: true,
  },
  {
    id: 2,
    title: 'Ballett Fortgeschritten',
    age: '6–9 J.',
    day: 'Montag',
    time: '10:30–12:00',
    spots: 10,
    booked: 10,
    price: 65,
    active: true,
  },
  {
    id: 3,
    title: 'Kinderfußball U6',
    age: '3–5 J.',
    day: 'Dienstag',
    time: '15:00–16:00',
    spots: 15,
    booked: 10,
    price: 45,
    active: true,
  },
  {
    id: 4,
    title: 'Musikzwerge',
    age: '0–2 J.',
    day: 'Mittwoch',
    time: '10:00–10:45',
    spots: 8,
    booked: 8,
    price: 50,
    active: false,
  },
]

const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const ageGroups = ['0–2 J.', '3–5 J.', '6–9 J.', '10–14 J.', '14+ J.']

const emptyForm = { title: '', age: '3–5 J.', day: 'Montag', time: '', spots: '', price: '' }

export default function Activities() {
  const [activities, setActivities] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const openNew = () => {
    setForm(emptyForm)
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (a) => {
    setForm({ title: a.title, age: a.age, day: a.day, time: a.time, spots: String(a.spots), price: String(a.price) })
    setEditId(a.id)
    setShowModal(true)
  }

  const save = () => {
    if (!form.title || !form.time || !form.spots) return
    if (editId) {
      setActivities(prev =>
        prev.map(a =>
          a.id === editId
            ? { ...a, ...form, spots: Number(form.spots), price: Number(form.price) }
            : a
        )
      )
    } else {
      setActivities(prev => [
        ...prev,
        { id: Date.now(), ...form, spots: Number(form.spots), price: Number(form.price), booked: 0, active: true },
      ])
    }
    setShowModal(false)
  }

  const remove = (id) => setActivities(prev => prev.filter(a => a.id !== id))
  const toggle = (id) => setActivities(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))

  return (
    <div>
      <Header title="Aktivitäten" subtitle="Verwalten Sie Ihre Kurse und Angebote" />

      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <button onClick={openNew} className="btn-primary">
            <Plus size={16} />
            Aktivität hinzufügen
          </button>
        </div>

        <div className="space-y-3">
          {activities.map((a) => {
            const fill = Math.round((a.booked / a.spots) * 100)
            const full = a.booked >= a.spots
            return (
              <div key={a.id} className={`card p-5 flex flex-col md:flex-row md:items-center gap-4 ${!a.active ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                    <span className="badge-gray">{a.age}</span>
                    {full && <span className="badge-red">Ausgebucht</span>}
                    {!a.active && <span className="badge-yellow">Inaktiv</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} />{a.day} · {a.time}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{a.booked}/{a.spots} Plätze</span>
                    <span className="flex items-center gap-1"><Euro size={12} />{a.price}/Monat</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                    <div
                      className={`h-full rounded-full ${full ? 'bg-red-400' : 'bg-brand-500'}`}
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggle(a.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      a.active
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'border-brand-300 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {a.active ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                  <button onClick={() => openEdit(a)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(a.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              {editId ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
            </h2>

            <div>
              <label className="label">Name der Aktivität</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Ballett Anfänger" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Altersgruppe</label>
                <select className="input" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}>
                  {ageGroups.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Wochentag</label>
                <select className="input" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Uhrzeit</label>
                <input className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="09:00–10:00" />
              </div>
              <div>
                <label className="label">Max. Teilnehmer</label>
                <input className="input" type="number" value={form.spots} onChange={e => setForm(f => ({ ...f, spots: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Preis (€/Monat)</label>
              <input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Abbrechen</button>
              <button onClick={save} className="btn-primary">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
