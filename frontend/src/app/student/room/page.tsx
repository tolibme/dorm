'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import { useAuth } from '@/context/AuthContext'
import type { Assignment, Room, Dormitory } from '@/lib/types'

export default function MyRoomPage() {
  const { user } = useAuth()
  const studentId = user!.user_id

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [dorm, setDorm] = useState<Dormitory | null>(null)
  const [roommates, setRoomates] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Assignment[]>('/assignments/').then(async r => {
      const active = r.data.find(x => x.student_id === studentId && x.status === 'active')
      if (active) {
        setAssignment(active)
        const [roomRes, allAssign] = await Promise.all([
          api.get<Room>(`/rooms/${active.room_id}`),
          api.get<Assignment[]>('/assignments/'),
        ])
        const rm = roomRes.data
        setRoom(rm)
        const dRes = await api.get<Dormitory>(`/dormitories/${rm.dorm_id}`)
        setDorm(dRes.data)
        setRoomates(allAssign.data.filter(a => a.room_id === active.room_id && a.student_id !== studentId && a.status === 'active').length)
      }
    }).finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>
  if (!assignment || !room) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center shadow-sm">
        <p className="text-gray-400">No active room assignment found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Room {room.room_number}</h2>
            <p className="text-gray-500 text-sm">{dorm?.name}</p>
          </div>
          <Badge status={room.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Type',         <span className="capitalize">{room.room_type}</span>],
            ['Monthly Fee',  `$${room.monthly_fee}`],
            ['Roommates',    roommates],
            ['Check-in',     assignment.check_in_date],
            ['Check-out',    assignment.check_out_date ?? '—'],
            ['Occupancy',    `${room.current_occupancy} / ${room.capacity}`],
          ].map(([label, val]) => (
            <div key={label as string} className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">{label}</span>
              <span className="font-semibold">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
