'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { useRequiredAuth } from '@/context/AuthContext'
import type { Dormitory } from '@/lib/types'

export default function ApplyPage() {
  const user = useRequiredAuth()
  const studentId = user.user_id

  const [dorms, setDorms] = useState<Dormitory[]>([])
  const [form, setForm] = useState({ dorm_id: '', preferred_move_in: '', room_preference: 'double' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    api.get<Dormitory[]>('/dormitories/').then(r => setDorms(r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      await api.post('/applications/', {
        student_id: studentId,
        dorm_id: Number(form.dorm_id),
        preferred_move_in: form.preferred_move_in || null,
        room_preference: form.room_preference,
      })
      setMessage({ type: 'success', text: 'Application submitted successfully!' })
      setForm({ dorm_id: '', preferred_move_in: '', room_preference: 'double' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to submit application.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Submit Housing Application</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dormitory</label>
            <select required value={form.dorm_id} onChange={e => setForm(f => ({ ...f, dorm_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select dormitory…</option>
              {dorms.map(d => (
                <option key={d.dorm_id} value={d.dorm_id}>{d.name} ({d.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Move-in Date</label>
            <input type="date" value={form.preferred_move_in}
              onChange={e => setForm(f => ({ ...f, preferred_move_in: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Preference</label>
            <select value={form.room_preference} onChange={e => setForm(f => ({ ...f, room_preference: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
