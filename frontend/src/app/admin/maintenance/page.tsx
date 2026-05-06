'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import DataTable, { Column } from '@/components/DataTable'
import type { MaintenanceRequest, Room, Dormitory, Student, Staff } from '@/lib/types'

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [rooms, setRooms] = useState<Record<number, Room>>({})
  const [dorms, setDorms] = useState<Record<number, Dormitory>>({})
  const [students, setStudents] = useState<Record<number, Student>>({})
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDorm, setFilterDorm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchAll = async () => {
    const [m, r, d, s, st] = await Promise.all([
      api.get<MaintenanceRequest[]>('/maintenance/'),
      api.get<Room[]>('/rooms/'),
      api.get<Dormitory[]>('/dormitories/'),
      api.get<Student[]>('/students/'),
      api.get<Staff[]>('/staff/'),
    ])
    setRequests(m.data)
    setRooms(Object.fromEntries(r.data.map(x => [x.room_id, x])))
    setDorms(Object.fromEntries(d.data.map(x => [x.dorm_id, x])))
    setStudents(Object.fromEntries(s.data.map(x => [x.student_id, x])))
    setStaffList(st.data)
  }

  useEffect(() => { fetchAll().finally(() => setLoading(false)) }, [])

  const handleUpdate = async (requestId: number, patch: Partial<MaintenanceRequest>) => {
    setUpdating(requestId)
    try {
      await api.patch(`/maintenance/${requestId}`, patch)
      fetchAll()
    } finally {
      setUpdating(null)
    }
  }

  const getDormForRoom = (roomId: number) => {
    const room = rooms[roomId]
    return room ? dorms[room.dorm_id] : null
  }

  const filtered = requests.filter(r => {
    const dorm = getDormForRoom(r.room_id)
    const dormMatch = !filterDorm || dorm?.name.toLowerCase().includes(filterDorm.toLowerCase())
    const statusMatch = !filterStatus || r.status === filterStatus
    return dormMatch && statusMatch
  })

  const columns: Column<MaintenanceRequest>[] = [
    { header: 'ID',       accessor: 'request_id' },
    { header: 'Room',     accessor: r => rooms[r.room_id]?.room_number ?? r.room_id },
    { header: 'Dorm',     accessor: r => getDormForRoom(r.room_id)?.name ?? '—' },
    { header: 'Student',  accessor: r => students[r.student_id]?.full_name ?? r.student_id },
    { header: 'Category', accessor: 'category' },
    { header: 'Priority', accessor: r => <Badge status={r.priority ?? 'medium'} /> },
    { header: 'Status',   accessor: r => <Badge status={r.status} /> },
    { header: 'Submitted',accessor: r => r.submitted_at.slice(0, 10) },
    {
      header: 'Assign To',
      accessor: r => (
        <select
          value={r.assigned_to ?? ''}
          onChange={e => handleUpdate(r.request_id, { assigned_to: e.target.value ? Number(e.target.value) : undefined })}
          disabled={updating === r.request_id}
          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        >
          <option value="">Unassigned</option>
          {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.full_name}</option>)}
        </select>
      ),
    },
    {
      header: 'Update Status',
      accessor: r => r.status !== 'resolved' ? (
        <div className="flex gap-1">
          {r.status === 'open' && (
            <button
              onClick={() => handleUpdate(r.request_id, { status: 'in_progress' })}
              disabled={updating === r.request_id}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Start
            </button>
          )}
          <button
            onClick={() => handleUpdate(r.request_id, { status: 'resolved' })}
            disabled={updating === r.request_id}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Resolve
          </button>
        </div>
      ) : <span className="text-gray-400 text-xs">Done</span>,
    },
  ]

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by dorm…"
          value={filterDorm}
          onChange={e => setFilterDorm(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Maintenance Requests</h2>
          <span className="text-sm text-gray-400">{requests.filter(r => r.status !== 'resolved').length} open</span>
        </div>
        <DataTable columns={columns} data={filtered} keyExtractor={r => r.request_id} />
      </div>
    </div>
  )
}
