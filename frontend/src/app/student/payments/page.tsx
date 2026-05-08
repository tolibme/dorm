'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Badge from '@/components/Badge'
import DataTable, { Column } from '@/components/DataTable'
import type { Payment } from '@/lib/types'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<number | null>(null)

  const fetchPayments = () => {
    api.get<Payment[]>('/payments/')
      .then(r => setPayments(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPayments() }, [])

  const handlePay = async (paymentId: number) => {
    setPaying(paymentId)
    try {
      await api.patch(`/payments/${paymentId}`, { status: 'paid' })
      fetchPayments()
    } finally {
      setPaying(null)
    }
  }

  const columns: Column<Payment>[] = [
    { header: 'ID',        accessor: 'payment_id' },
    { header: 'Type',      accessor: r => <span className="capitalize">{r.payment_type}</span> },
    { header: 'Amount',    accessor: r => `$${r.amount}` },
    { header: 'Due Date',  accessor: 'due_date' },
    { header: 'Paid Date', accessor: r => r.paid_date ?? '—' },
    { header: 'Receipt',   accessor: r => r.receipt_number ?? '—' },
    { header: 'Status',    accessor: r => <Badge status={r.status} /> },
    {
      header: 'Action',
      accessor: r => r.status !== 'paid'
        ? <button onClick={() => handlePay(r.payment_id)} disabled={paying === r.payment_id}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
            {paying === r.payment_id ? '…' : 'Pay Now'}
          </button>
        : <span className="text-gray-400 text-xs">—</span>,
    },
  ]

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const unpaid = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">${unpaid.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">All Payments</h2>
        </div>
        <DataTable columns={columns} data={payments} keyExtractor={p => p.payment_id} />
      </div>
    </div>
  )
}
