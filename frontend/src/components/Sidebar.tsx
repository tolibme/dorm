'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  items: NavItem[]
  role: string
  title?: string
}

export default function Sidebar({ items, role, title = 'DormMS' }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside className="w-60 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="w-4 h-4 shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{role}</span>
      </div>
    </aside>
  )
}
