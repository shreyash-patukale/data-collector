'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Iteration, Reading, User } from '@/lib/types'
import { formatDate, formatDateTime, tdsStatus, phStatus } from '@/utils/helpers'
import { iterationService, readingService } from '@/services/iterations'
import AddReadingModal from '@/components/forms/AddReadingModal'
import CloseIterationModal from '@/components/forms/CloseIterationModal'
import { ArrowLeft, Plus, Lock, Droplets, Sprout, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utils/helpers'

interface Props {
  iteration: Iteration
  readings:  Reading[]
  currentUser: User
}

export default function IterationDetail({ iteration: init, readings: initReadings, currentUser }: Props) {
  const router   = useRouter()
  const [iteration, setIteration] = useState(init)
  const [readings, setReadings]   = useState(initReadings)
  const [showAdd, setShowAdd]     = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [loading, setLoading]     = useState(false)
  const isActive = iteration.status === 'active'

  const handleAddReading = async (data: { tds: number; ph?: number; notes?: string }) => {
    setLoading(true)
    try {
      const r = await readingService.create({
        iteration_id: iteration.id,
        user_id: currentUser.id,
        ...data,
      })
      setReadings([{ ...r, users: currentUser }, ...readings])
      setShowAdd(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    setLoading(true)
    try {
      await iterationService.close(iteration.id)
      setIteration({ ...iteration, status: 'closed', closed_at: new Date().toISOString() })
      setShowClose(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-white">{iteration.crop_name}</h1>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                isActive ? 'bg-brand-500/15 text-brand-400' : 'bg-surface-border text-gray-500'
              )}>
                {iteration.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-brand-500" />
                {iteration.setups?.setup_name}
              </span>
              <span>#{iteration.iteration_number}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                {formatDate(iteration.start_date)}
              </span>
              <span>{iteration.season}</span>
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-brand-500" />
                {iteration.users?.name ?? 'Unknown'}
              </span>
              <span>{iteration.crop_qty} plants</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {isActive ? (
            <>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors flex-1 justify-center"
              >
                <Plus className="w-4 h-4" /> Add Reading
              </button>
              <button
                onClick={() => setShowClose(true)}
                className="flex items-center gap-2 bg-surface-hover border border-surface-border hover:border-red-500/40 text-gray-400 hover:text-red-400 text-sm rounded-xl px-4 py-2.5 transition-colors"
              >
                <Lock className="w-4 h-4" /> Close
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm bg-surface-border/40 rounded-xl px-4 py-2.5">
              <Lock className="w-4 h-4" /> This iteration is closed
            </div>
          )}
        </div>
      </div>

      {/* Readings */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4" /> Readings ({readings.length})
        </h2>

        {readings.length === 0 ? (
          <div className="text-center py-12 bg-surface-card border border-surface-border rounded-2xl">
            <Droplets className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No readings yet</p>
            {isActive && (
              <button onClick={() => setShowAdd(true)} className="mt-3 text-brand-400 text-sm underline">
                Log first reading
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map((r) => {
              const tds = tdsStatus(r.tds)
              const ph  = r.ph ? phStatus(r.ph) : null
              return (
                <div key={r.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500">TDS</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-white font-mono">{r.tds}</span>
                          <span className="text-[10px] text-gray-600">ppm</span>
                          <span className={cn('text-xs font-medium', tds.color)}>{tds.label}</span>
                        </div>
                      </div>
                      {r.ph && (
                        <div className="border-l border-surface-border pl-3">
                          <span className="text-xs font-medium text-gray-500">pH</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-white font-mono">{r.ph}</span>
                            <span className={cn('text-xs font-medium', ph?.color)}>{ph?.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {r.notes && (
                    <p className="text-sm text-gray-400 bg-surface-border/30 rounded-lg px-3 py-2 mb-2">{r.notes}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>by {r.users?.name ?? 'Unknown'}</span>
                    <span>{formatDateTime(r.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddReadingModal
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddReading}
          loading={loading}
        />
      )}
      {showClose && (
        <CloseIterationModal
          onClose={() => setShowClose(false)}
          onConfirm={handleClose}
          loading={loading}
        />
      )}
    </div>
  )
}
