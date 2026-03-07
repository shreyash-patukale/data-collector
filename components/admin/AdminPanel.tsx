'use client'

import { useState } from 'react'
import type { Iteration, User, Setup, Reading } from '@/lib/types'
import { iterationService } from '@/services/iterations'
import { formatDateTime } from '@/utils/helpers'
import { Users, Layers, Sprout, Activity, Trash2, RefreshCw, Shield } from 'lucide-react'
import { cn } from '@/utils/helpers'

type Tab = 'iterations' | 'users' | 'setups' | 'activity'

interface Props {
  iterations: Iteration[]
  users:      User[]
  setups:     Setup[]
  readings:   Reading[]
}

export default function AdminPanel({ iterations: initIter, users, setups, readings }: Props) {
  const [tab, setTab]               = useState<Tab>('iterations')
  const [iterations, setIterations] = useState(initIter)
  const [loading, setLoading]       = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this iteration and ALL its readings? This cannot be undone.')) return
    setLoading(id)
    try {
      await iterationService.delete(id)
      setIterations((prev) => prev.filter((i) => i.id !== id))
    } finally {
      setLoading(null)
    }
  }

  const handleReopen = async (id: string) => {
    setLoading(id)
    try {
      await iterationService.reopen(id)
      setIterations((prev) => prev.map((i) => i.id === id ? { ...i, status: 'active', closed_at: null } : i))
    } finally {
      setLoading(null)
    }
  }

  const tabs = [
    { id: 'iterations' as Tab, label: 'Iterations', icon: Sprout, count: iterations.length },
    { id: 'users'      as Tab, label: 'Users',      icon: Users,  count: users.length },
    { id: 'setups'     as Tab, label: 'Setups',     icon: Layers, count: setups.length },
    { id: 'activity'   as Tab, label: 'Activity',   icon: Activity, count: readings.length },
  ]

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active', value: iterations.filter(i => i.status === 'active').length, color: 'text-brand-400' },
          { label: 'Closed', value: iterations.filter(i => i.status === 'closed').length, color: 'text-gray-400' },
          { label: 'Employees', value: users.filter(u => u.role === 'employee').length, color: 'text-blue-400' },
          { label: 'Readings', value: readings.length, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-card border border-surface-border rounded-2xl p-4">
            <div className={cn('text-2xl font-bold font-mono', s.color)}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-card border border-surface-border rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 flex-1 justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all',
              tab === t.id
                ? 'bg-brand-500 text-black'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="bg-black/20 rounded-full px-1.5 py-0.5 text-[10px]">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab: Iterations */}
      {tab === 'iterations' && (
        <div className="space-y-3">
          {iterations.map((it) => (
            <div key={it.id} className="bg-surface-card border border-surface-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{it.crop_name}</span>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      it.status === 'active' ? 'bg-brand-500/15 text-brand-400' : 'bg-surface-border text-gray-500'
                    )}>
                      {it.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {(it as any).setups?.setup_name} · #{it.iteration_number} · by {(it as any).users?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {it.status === 'closed' && (
                    <button
                      onClick={() => handleReopen(it.id)}
                      disabled={loading === it.id}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                      title="Reopen"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(it.id)}
                    disabled={loading === it.id}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Users */}
      {tab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-brand-400">{u.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-1 rounded-full uppercase',
                u.role === 'admin' ? 'bg-red-500/15 text-red-400' : 'bg-surface-border text-gray-500'
              )}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Setups */}
      {tab === 'setups' && (
        <div className="space-y-3">
          {setups.map((s) => (
            <div key={s.id} className="bg-surface-card border border-surface-border rounded-2xl p-4">
              <div className="font-semibold text-white">{s.setup_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.location} · {s.plant_capacity} plants</div>
              {s.description && <p className="text-sm text-gray-400 mt-2">{s.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Activity */}
      {tab === 'activity' && (
        <div className="space-y-3">
          {readings.map((r: any) => (
            <div key={r.id} className="bg-surface-card border border-surface-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-sm">
                  TDS: <span className="font-mono text-brand-400">{r.tds}</span>
                  {r.ph && <> · pH: <span className="font-mono text-blue-400">{r.ph}</span></>}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                by <span className="text-gray-400">{r.users?.name}</span>
                {' '}on <span className="text-gray-400">{r.iterations?.crop_name} #{r.iterations?.iteration_number}</span>
                {' '}· {formatDateTime(r.created_at)}
              </div>
              {r.notes && <p className="text-xs text-gray-500 mt-1.5 italic">"{r.notes}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
