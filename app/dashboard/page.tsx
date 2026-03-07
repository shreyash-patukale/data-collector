import { createServerSupabaseClient } from '@/lib/supabase-server'
import IterationCard from '@/components/dashboard/IterationCard'
import Link from 'next/link'
import { Plus, Sprout, Archive } from 'lucide-react'
import type { Iteration } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: iterations } = await supabase
    .from('iterations')
    .select(`*, setups(*), users(id, name, email)`)
    .order('created_at', { ascending: false })

  const active = (iterations as Iteration[])?.filter((i) => i.status === 'active') ?? []
  const closed = (iterations as Iteration[])?.filter((i) => i.status === 'closed') ?? []

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Iterations</h1>
          <p className="text-gray-500 text-sm">{active.length} active · {closed.length} closed</p>
        </div>
        <Link
          href="/dashboard/iterations/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {/* Active iterations */}
      {active.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-brand-400 uppercase tracking-widest">Active</h2>
          </div>
          <div className="space-y-3">
            {active.map((it) => (
              <IterationCard key={it.id} iteration={it} />
            ))}
          </div>
        </section>
      )}

      {/* Closed iterations */}
      {closed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Archive className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Closed</h2>
          </div>
          <div className="space-y-3">
            {closed.map((it) => (
              <IterationCard key={it.id} iteration={it} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {iterations?.length === 0 && (
        <div className="text-center py-20">
          <Sprout className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No iterations yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first crop iteration to start logging</p>
          <Link href="/dashboard/iterations/new" className="inline-flex items-center gap-2 mt-5 bg-brand-500 text-black font-semibold rounded-xl px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> Create iteration
          </Link>
        </div>
      )}
    </div>
  )
}
