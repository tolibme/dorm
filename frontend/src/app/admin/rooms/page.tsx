'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import DataTable, { Column } from '@/components/DataTable'
import type { Room, Dormitory } from '@/lib/types'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [dorms, setDorms] = useState<Record<number, Dormitory>>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Room | null>(null)
  const [editForm, setEditForm] = useState({ capacity: '', monthly_fee: '', status: '' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')

  const fetchAll = async () => {
    const [r, d] = await Promise.all([
      api.get<Room[]>('/rooms/'),
      api.get<Dormitory[]>('/dormitories/'),
    ])
    setRooms(r.data)
    setDorms(Object.fromEntries(d.data.map(x => [x.dorm_id, x])))
  }

  useEffect(() => { fetchAll().finally(() => setLoading(false)) }, [])

  const openEdit = (room: Room) => {
    setEditing(room)
    setEditForm({ capacity: String(room.capacity), monthly_fee: String(room.monthly_fee ?? ''), status: room.status })
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api.patch(`/rooms/${editing.room_id}`, {
        capacity: Number(editForm.capacity),
        monthly_fee: editForm.monthly_fee ? Number(editForm.monthly_fee) : null,
        status: editForm.status,
      })
      setEditing(null)
      fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const filtered = rooms.filter(r =>
    !filter || dorms[r.dorm_id]?.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.room_number.includes(filter)
  )

  const OccupancyBar = ({ room }: { room: Room }) => {
    const pct = Math.round((room.current_occupancy / room.capacity) * 100)
    const color = pct >= 100 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-green-500'
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{room.current_occupancy}/{room.capacity}</span>
      </div>
    )
  }

  const columns: Column<Room>[] = [
    { header: 'Room #',    accessor: 'room_number' },
    { header: 'Dorm',      accessor: r => dorms[r.dorm_id]?.name ?? r.dorm_id },
    { header: 'Type',      accessor: r => <span className="capitalize">{r.room_type}</span> },
    { header: 'Occupancy', accessor: r => <OccupancyBar room={r} /> },
    { header: 'Fee/mo',    accessor: r => r.monthly_fee ? `$${r.monthly_fee}` : '—' },
    { header: 'Status',    accessor: r => <Badge status={r.status} /> },
    {
      header: 'Edit',
      accessor: r => (
        <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
      ),
    },
  ]

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by dorm or room number…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Rooms</h2>
          <span className="text-sm text-gray-400">{rooms.filter(r => r.status === 'available').length} available</span>
        </div>
        <DataTable columns={columns} data={filtered} keyExtractor={r => r.room_id} />
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">Edit Room {editing.room_number}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" min={1} value={editForm.capacity}
                  onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
                <input type="number" min={0} value={editForm.monthly_fee}
                  onChange={e => setEditForm(f => ({ ...f, monthly_fee: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
