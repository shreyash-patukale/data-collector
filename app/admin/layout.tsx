import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-4xl mx-auto">
          <a href="/dashboard" className="text-gray-500 hover:text-gray-300 text-sm">← Back</a>
          <span className="text-gray-700">/</span>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-lg font-semibold uppercase tracking-wider">Admin</span>
            Panel
          </h1>
        </div>
      </header>
      <main className="pb-12">{children}</main>
    </div>
  )
}
