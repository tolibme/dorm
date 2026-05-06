import React from 'react'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  emptyMessage?: string
}

export default function DataTable<T>({ columns, data, keyExtractor, emptyMessage = 'No records found' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String((row[col.accessor] as React.ReactNode) ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
