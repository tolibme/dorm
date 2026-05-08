'use client'
import { useEffect, useState } from 'react'
import { BedDouble, CreditCard, Wrench, FileText } from 'lucide-react'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import api from '@/lib/axios'
import type { Assignment, Payment, MaintenanceRequest, Application, Room } from '@/lib/types'

export default function StudentDashboard() {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Assignment[]>('/assignments/', { params: { status: 'active' } }),
      api.get<Payment[]>('/payments/'),
      api.get<MaintenanceRequest[]>('/maintenance/'),
      api.get<Application[]>('/applications/', { params: { status: 'pending' } }),
    ]).then(async ([a, p, m, app]) => {
      const active = a.data[0] ?? null
      setAssignment(active)
      if (active) {
        const r = await api.get<Room>(`/rooms/${active.room_id}`)
        setRoom(r.data)
      }
      setPayments(p.data.filter(x => x.status !== 'paid'))
      setMaintenance(m.data.filter(x => x.status !== 'resolved'))
      setApplication(app.data[0] ?? null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BedDouble size={20} />}  label="Room Status"          value={room ? `Room ${room.room_number}` : 'Not Assigned'} color="blue" />
        <StatCard icon={<FileText size={20} />}   label="Pending Application"  value={application ? application.status : 'None'}          color="yellow" />
        <StatCard icon={<CreditCard size={20} />} label="Outstanding Payments" value={payments.length}                                     color="red" />
        <StatCard icon={<Wrench size={20} />}     label="Open Requests"        value={maintenance.length}                                  color="purple" />
      </div>

      {assignment && room && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Current Assignment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400 block">Room</span><span className="font-medium">{room.room_number}</span></div>
            <div><span className="text-gray-400 block">Type</span><span className="font-medium capitalize">{room.room_type}</span></div>
            <div><span className="text-gray-400 block">Check-in</span><span className="font-medium">{assignment.check_in_date}</span></div>
            <div><span className="text-gray-400 block">Monthly Fee</span><span className="font-medium">${room.monthly_fee}</span></div>
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Outstanding Payments</h2>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.payment_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">Due {p.due_date}</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${p.amount}</span>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
