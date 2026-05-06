const colorMap: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  approved:    'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  active:      'bg-blue-100 text-blue-800',
  completed:   'bg-gray-100 text-gray-700',
  full:        'bg-red-100 text-red-800',
  available:   'bg-green-100 text-green-800',
  maintenance: 'bg-purple-100 text-purple-800',
  open:        'bg-orange-100 text-orange-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved:    'bg-gray-100 text-gray-700',
  paid:        'bg-green-100 text-green-800',
  unpaid:      'bg-yellow-100 text-yellow-800',
  overdue:     'bg-red-100 text-red-800',
  low:         'bg-gray-100 text-gray-700',
  medium:      'bg-yellow-100 text-yellow-800',
  high:        'bg-orange-100 text-orange-800',
  urgent:      'bg-red-100 text-red-800',
}

export default function Badge({ status }: { status: string }) {
  const cls = colorMap[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
