'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { iterationService } from '@/services/iterations'
import type { Setup } from '@/lib/types'
import { Loader2 } from 'lucide-react'

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round']

export default function CreateIterationForm({ setups, userId }: { setups: Setup[]; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    setup_id:         '',
    iteration_number: '',
    crop_name:        '',
    crop_qty:         '',
    season:           '',
    start_date:       new Date().toISOString().split('T')[0],
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const it = await iterationService.create({
        setup_id:         form.setup_id,
        iteration_number: parseInt(form.iteration_number),
        crop_name:        form.crop_name,
        crop_qty:         parseInt(form.crop_qty),
        season:           form.season,
        start_date:       form.start_date,
        created_by:       userId,
      })
      router.push(`/dashboard/iterations/${it.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create iteration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Setup *</label>
        <select
          value={form.setup_id}
          onChange={(e) => set('setup_id', e.target.value)}
          required
          className="input-base"
        >
          <option value="">Select setup…</option>
          {setups.map((s) => (
            <option key={s.id} value={s.id}>{s.setup_name} — {s.location}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Iteration #</label>
          <input
            type="number"
            min={1}
            value={form.iteration_number}
            onChange={(e) => set('iteration_number', e.target.value)}
            placeholder="1"
            required
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Plant Qty</label>
          <input
            type="number"
            min={1}
            value={form.crop_qty}
            onChange={(e) => set('crop_qty', e.target.value)}
            placeholder="50"
            required
            className="input-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Crop Name *</label>
        <input
          type="text"
          value={form.crop_name}
          onChange={(e) => set('crop_name', e.target.value)}
          placeholder="e.g. Basil, Lettuce, Spinach"
          required
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Season *</label>
        <select
          value={form.season}
          onChange={(e) => set('season', e.target.value)}
          required
          className="input-base"
        >
          <option value="">Select season…</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Start Date *</label>
        <input
          type="date"
          value={form.start_date}
          onChange={(e) => set('start_date', e.target.value)}
          required
          className="input-base"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Creating…' : 'Create Iteration'}
      </button>
    </form>
  )
}
