'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import DataTable, { Column } from '@/components/DataTable'
import { useAuth } from '@/context/AuthContext'
import type { Application, Room, Student, Dormitory } from '@/lib/types'

interface ReviewModal {
  app: Application
  rooms: Room[]
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const staffId = user!.user_id

  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents] = useState<Record<number, Student>>({})
  const [dorms, setDorms] = useState<Record<number, Dormitory>>({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ReviewModal | null>(null)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const fetchAll = async () => {
    const [a, s, d] = await Promise.all([
      api.get<Application[]>('/applications/'),
      api.get<Student[]>('/students/'),
      api.get<Dormitory[]>('/dormitories/'),
    ])
    setApplications(a.data)
    setStudents(Object.fromEntries(s.data.map(x => [x.student_id, x])))
    setDorms(Object.fromEntries(d.data.map(x => [x.dorm_id, x])))
  }

  useEffect(() => { fetchAll().finally(() => setLoading(false)) }, [])

  const openApproveModal = async (app: Application) => {
    const r = await api.get<Room[]>('/rooms/available')
    const dormRooms = r.data.filter(x => x.dorm_id === app.dorm_id)
    setSelectedRoom('')
    setCheckOut('')
    setModal({ app, rooms: dormRooms })
  }

  const handleReject = async (app: Application) => {
    await api.patch(`/applications/${app.application_id}/review`, {
      action: 'rejected',
      reviewed_by: staffId,
    })
    fetchAll()
  }

  const handleApprove = async () => {
    if (!modal || !selectedRoom) return
    setReviewing(true)
    try {
      await api.patch(`/applications/${modal.app.application_id}/review`, {
        action: 'approved',
        reviewed_by: staffId,
        room_id: Number(selectedRoom),
        check_out_date: checkOut || null,
      })
      setModal(null)
      fetchAll()
    } finally {
      setReviewing(false)
    }
  }

  const columns: Column<Application>[] = [
    { header: 'ID',       accessor: 'application_id' },
    { header: 'Student',  accessor: r => students[r.student_id]?.full_name ?? r.student_id },
    { header: 'Dorm',     accessor: r => dorms[r.dorm_id]?.name ?? r.dorm_id },
    { header: 'Pref. Move-in', accessor: r => r.preferred_move_in ?? '—' },
    { header: 'Room Pref', accessor: r => <span className="capitalize">{r.room_preference ?? '—'}</span> },
    { header: 'Applied',  accessor: r => r.applied_at.slice(0, 10) },
    { header: 'Status',   accessor: r => <Badge status={r.status} /> },
    {
      header: 'Actions',
      accessor: r => r.status === 'pending' ? (
        <div className="flex gap-2">
          <button onClick={() => openApproveModal(r)}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
          <button onClick={() => handleReject(r)}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
        </div>
      ) : <span className="text-gray-400 text-xs">—</span>,
    },
  ]

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Applications</h2>
          <span className="text-sm text-gray-400">{applications.filter(a => a.status === 'pending').length} pending</span>
        </div>
        <DataTable columns={columns} data={applications} keyExtractor={a => a.application_id} />
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">Approve Application #{modal.app.application_id}</h3>
            <p className="text-sm text-gray-400 mb-4">
              Student: {students[modal.app.student_id]?.full_name} · Dorm: {dorms[modal.app.dorm_id]?.name}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Room</label>
                <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select available room…</option>
                  {modal.rooms.map(r => (
                    <option key={r.room_id} value={r.room_id}>
                      Room {r.room_number} ({r.room_type}) — {r.current_occupancy}/{r.capacity} — ${r.monthly_fee}/mo
                    </option>
                  ))}
                </select>
                {modal.rooms.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No available rooms in this dormitory.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Check-out Date</label>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={!selectedRoom || reviewing}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {reviewing ? 'Approving…' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
