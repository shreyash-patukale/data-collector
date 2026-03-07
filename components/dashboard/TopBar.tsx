'use client'

import { Droplets, Bell } from 'lucide-react'
import Link from 'next/link'
import { useNotifications } from '@/hooks/useNotifications'
import type { User } from '@/lib/types'

export default function TopBar({ user }: { user: User | null }) {
  const { granted, enable } = useNotifications(user?.id)

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-500/15 rounded-lg flex items-center justify-center border border-brand-500/20">
            <Droplets className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">HydroTrack</span>
        </Link>

        <div className="flex items-center gap-2">
          {!granted && (
            <button
              onClick={enable}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-500/10"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enable alerts</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-400">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
