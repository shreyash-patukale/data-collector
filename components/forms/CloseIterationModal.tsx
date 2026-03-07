'use client'

import { useState } from 'react'
import { X, Loader2, AlertTriangle } from 'lucide-react'

interface Props {
  onClose:   () => void
  onConfirm: () => Promise<void>
  loading:   boolean
}

export default function CloseIterationModal({ onClose, onConfirm, loading }: Props) {
  const [input, setInput] = useState('')
  const confirmed = input === 'close'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-red-500/20 rounded-2xl w-full max-w-sm p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-white">Close Iteration?</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Closing this iteration will prevent any new readings from being added. This action can only be undone by an admin.
        </p>

        <div className="bg-surface/60 border border-red-500/10 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">
            Type <span className="font-mono text-red-400 font-bold">close</span> to confirm
          </p>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="close"
            className="input-base text-sm"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || loading}
            className="flex-1 btn-danger flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Closing…' : 'Close Iteration'}
          </button>
        </div>
      </div>
    </div>
  )
}
