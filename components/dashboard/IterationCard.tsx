import Link from 'next/link'
import type { Iteration } from '@/lib/types'
import { formatDate } from '@/utils/helpers'
import { ChevronRight, Sprout, Calendar } from 'lucide-react'
import { cn } from '@/utils/helpers'

export default function IterationCard({ iteration }: { iteration: Iteration }) {
  const isActive = iteration.status === 'active'

  return (
    <Link href={`/dashboard/iterations/${iteration.id}`} className="card-interactive flex items-center gap-4">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isActive ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-surface-border/40 border border-surface-border'
      )}>
        <Sprout className={cn('w-5 h-5', isActive ? 'text-brand-400' : 'text-gray-600')} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-white text-sm truncate">{iteration.crop_name}</span>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0',
            isActive ? 'bg-brand-500/15 text-brand-400' : 'bg-surface-border text-gray-500'
          )}>
            {iteration.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{iteration.setups?.setup_name ?? 'Unknown setup'}</span>
          <span>·</span>
          <span>#{iteration.iteration_number}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(iteration.start_date)}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0" />
    </Link>
  )
}
