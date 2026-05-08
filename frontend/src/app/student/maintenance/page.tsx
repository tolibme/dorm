'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import DataTable, { Column } from '@/components/DataTable'
import { useRequiredAuth } from '@/context/AuthContext'
import type { MaintenanceRequest, Assignment } from '@/lib/types'

const categories = ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'General']

export default function StudentMaintenancePage() {
  const user = useRequiredAuth()
  const studentId = user.user_id

  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [form, setForm] = useState({ category: 'Plumbing', description: '', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = async () => {
    const [mr, as] = await Promise.all([
      api.get<MaintenanceRequest[]>('/maintenance/'),
      api.get<Assignment[]>('/assignments/', { params: { status: 'active' } }),
    ])
    setRequests(mr.data)
    setRoomId(as.data[0]?.room_id ?? null)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId) { setMessage({ type: 'error', text: 'You must have an active room assignment to submit a request.' }); return }
    setSubmitting(true); setMessage(null)
    try {
      await api.post('/maintenance/', { room_id: roomId, student_id: studentId, ...form })
      setMessage({ type: 'success', text: 'Request submitted.' })
      setForm({ category: 'Plumbing', description: '', priority: 'medium' })
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Submission failed.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<MaintenanceRequest>[] = [
    { header: 'ID',        accessor: 'request_id' },
    { header: 'Category',  accessor: 'category' },
    { header: 'Priority',  accessor: r => <Badge status={r.priority ?? 'medium'} /> },
    { header: 'Status',    accessor: r => <Badge status={r.status} /> },
    { header: 'Submitted', accessor: r => r.submitted_at.slice(0, 10) },
    { header: 'Resolved',  accessor: r => r.resolved_at ? r.resolved_at.slice(0, 10) : '—' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <h2 className="font-semibold text-gray-900 mb-4">New Maintenance Request</h2>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the issue…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">My Requests</h2>
        </div>
        <DataTable columns={columns} data={requests} keyExtractor={r => r.request_id} />
      </div>
    </div>
  )
}
