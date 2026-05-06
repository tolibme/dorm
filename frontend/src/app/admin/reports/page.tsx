'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import api from '@/lib/axios'
import Badge from '@/components/Badge'

interface OccupancyRow {
  dorm_id: number
  name: string
  total_rooms: number
  total_occupied: number
  total_capacity: number
  occupancy_rate: number
}

interface UnpaidRow {
  payment_id: number
  student_id: number
  student_name: string
  amount: number
  status: string
  due_date: string
}

interface MaintenanceRow {
  dorm_name: string
  status: string
  count: number
}

interface MonthlyRow {
  month: string
  count: number
}

export default function ReportsPage() {
  const [occupancy, setOccupancy] = useState<OccupancyRow[]>([])
  const [unpaid, setUnpaid] = useState<UnpaidRow[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([])
  const [monthly, setMonthly] = useState<MonthlyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<OccupancyRow[]>('/reports/occupancy'),
      api.get<UnpaidRow[]>('/reports/unpaid'),
      api.get<MaintenanceRow[]>('/reports/maintenance'),
      api.get<MonthlyRow[]>('/reports/monthly-occupancy'),
    ]).then(([o, u, m, mo]) => {
      setOccupancy(o.data)
      setUnpaid(u.data)
      setMaintenance(m.data)
      setMonthly(mo.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  const maintByDorm = maintenance.reduce<Record<string, Record<string, number>>>((acc, row) => {
    if (!acc[row.dorm_name]) acc[row.dorm_name] = {}
    acc[row.dorm_name][row.status] = row.count
    return acc
  }, {})
  const maintChartData = Object.entries(maintByDorm).map(([name, statuses]) => ({ name, ...statuses }))

  return (
    <div className="space-y-8">
      {/* Occupancy rate by dorm */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Occupancy Rate by Dormitory</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={occupancy} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="occupancy_rate" name="Occupancy %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {occupancy.map(d => (
            <div key={d.dorm_id} className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-800">{d.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {d.total_occupied} / {d.total_capacity} beds · {d.occupancy_rate}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly occupancy trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Monthly Check-ins Trend</h2>
        {monthly.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Check-ins" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Maintenance breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Maintenance Requests by Dorm &amp; Status</h2>
        {maintChartData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={maintChartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="open"        name="Open"        fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="in_progress" name="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved"    name="Resolved"    fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Unpaid payments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Unpaid &amp; Overdue Payments</h2>
          <span className="text-sm text-gray-400">{unpaid.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student', 'Amount', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {unpaid.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No unpaid payments.</td></tr>
              ) : unpaid.map(p => (
                <tr key={p.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.student_name}</td>
                  <td className="px-4 py-3">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.due_date}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
