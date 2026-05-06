'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar, { NavItem } from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, FilePlus, BedDouble, CreditCard, Wrench } from 'lucide-react'

const navItems: NavItem[] = [
  { href: '/student/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={16} /> },
  { href: '/student/apply',       label: 'Apply',        icon: <FilePlus size={16} /> },
  { href: '/student/room',        label: 'My Room',      icon: <BedDouble size={16} /> },
  { href: '/student/payments',    label: 'Payments',     icon: <CreditCard size={16} /> },
  { href: '/student/maintenance', label: 'Maintenance',  icon: <Wrench size={16} /> },
]

const titles: Record<string, string> = {
  '/student/dashboard':   'Dashboard',
  '/student/apply':       'Apply for Housing',
  '/student/room':        'My Room',
  '/student/payments':    'Payments',
  '/student/maintenance': 'Maintenance Requests',
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (user.role !== 'student') router.replace('/admin/dashboard')
  }, [user, loading, router])

  if (loading || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="Student Portal" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={titles[pathname] ?? 'Student Portal'} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
