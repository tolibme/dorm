'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar, { NavItem } from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, ClipboardList, BedDouble, Users, Wrench, BarChart2 } from 'lucide-react'

const navItems: NavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={16} /> },
  { href: '/admin/applications', label: 'Applications', icon: <ClipboardList size={16} /> },
  { href: '/admin/rooms',        label: 'Rooms',        icon: <BedDouble size={16} /> },
  { href: '/admin/students',     label: 'Students',     icon: <Users size={16} /> },
  { href: '/admin/maintenance',  label: 'Maintenance',  icon: <Wrench size={16} /> },
  { href: '/admin/reports',      label: 'Reports',      icon: <BarChart2 size={16} /> },
]

const titles: Record<string, string> = {
  '/admin/dashboard':    'Dashboard',
  '/admin/applications': 'Applications',
  '/admin/rooms':        'Rooms',
  '/admin/students':     'Students',
  '/admin/maintenance':  'Maintenance',
  '/admin/reports':      'Reports',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (user.role !== 'staff') router.replace('/student/dashboard')
  }, [user, loading, router])

  if (loading || !user || user.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="Admin Panel" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={titles[pathname] ?? 'Admin'} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
