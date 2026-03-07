'use client'

import { useState } from 'react'
import { X, Loader2, Droplets } from 'lucide-react'

interface Props {
  onClose:  () => void
  onSubmit: (data: { tds: number; ph?: number; notes?: string }) => Promise<void>
  loading:  boolean
}

export default function AddReadingModal({ onClose, onSubmit, loading }: Props) {
  const [tds, setTds]     = useState('')
  const [ph, setPh]       = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      tds:   parseFloat(tds),
      ph:    ph ? parseFloat(ph) : undefined,
      notes: notes || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-white">Log Reading</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              TDS <span className="text-gray-600 font-normal">(ppm) *</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="9999"
              value={tds}
              onChange={(e) => setTds(e.target.value)}
              placeholder="e.g. 850"
              required
              className="input-base text-lg font-mono"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              pH <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              placeholder="e.g. 6.2"
              className="input-base text-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Notes <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations…"
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving…' : 'Save Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
