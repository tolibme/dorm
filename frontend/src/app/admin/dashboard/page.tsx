'use client'
import { useEffect, useState } from 'react'
import { Users, BedDouble, ClipboardList, Wrench, CreditCard } from 'lucide-react'
import StatCard from '@/components/StatCard'
import api from '@/lib/axios'
import type { Student, Room, Application, MaintenanceRequest, Payment } from '@/lib/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    occupiedRooms: 0,
    pendingApplications: 0,
    openMaintenance: 0,
    unpaidPayments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Student[]>('/students/'),
      api.get<Room[]>('/rooms/'),
      api.get<Application[]>('/applications/'),
      api.get<MaintenanceRequest[]>('/maintenance/'),
      api.get<Payment[]>('/payments/'),
    ]).then(([s, r, a, m, p]) => {
      setStats({
        students: s.data.length,
        occupiedRooms: r.data.filter(x => x.current_occupancy > 0).length,
        pendingApplications: a.data.filter(x => x.status === 'pending').length,
        openMaintenance: m.data.filter(x => x.status !== 'resolved').length,
        unpaidPayments: p.data.filter(x => x.status !== 'paid').length,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={<Users size={20} />}         label="Total Students"       value={stats.students}             color="blue" />
        <StatCard icon={<BedDouble size={20} />}     label="Occupied Rooms"       value={stats.occupiedRooms}        color="green" />
        <StatCard icon={<ClipboardList size={20} />} label="Pending Applications" value={stats.pendingApplications}  color="yellow" />
        <StatCard icon={<Wrench size={20} />}        label="Open Maintenance"     value={stats.openMaintenance}      color="red" />
        <StatCard icon={<CreditCard size={20} />}    label="Unpaid Payments"      value={stats.unpaidPayments}       color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Quick Links</h2>
        <p className="text-sm text-gray-400 mb-4">Navigate to a section to manage records.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Review Applications', href: '/admin/applications', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            { label: 'Manage Rooms',        href: '/admin/rooms',        color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'View Students',       href: '/admin/students',     color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { label: 'Maintenance Queue',   href: '/admin/maintenance',  color: 'bg-red-50 text-red-700 hover:bg-red-100' },
            { label: 'View Reports',        href: '/admin/reports',      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          ].map(l => (
            <a key={l.href} href={l.href} className={`px-4 py-3 rounded-lg font-medium transition-colors ${l.color}`}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
