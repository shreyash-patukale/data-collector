'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Plus, Shield, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/helpers'

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/dashboard/iterations/new', icon: Plus, label: 'New', accent: true },
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-border safe-bottom">
      <div className="flex items-center justify-around px-4 h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 flex-1 py-2 transition-colors',
                item.accent
                  ? 'text-brand-400'
                  : active
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                item.accent
                  ? 'bg-brand-500 text-black'
                  : active
                  ? 'bg-surface-hover'
                  : ''
              )}>
                <item.icon className={cn('w-5 h-5', item.accent ? 'w-4 h-4' : '')} />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-gray-400 transition-colors"
        >
          <div className="p-2 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium leading-none">Logout</span>
        </button>
      </div>
    </nav>
  )
}
