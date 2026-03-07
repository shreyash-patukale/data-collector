import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import BottomNav from '@/components/dashboard/BottomNav'
import TopBar from '@/components/dashboard/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar user={profile} />
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>
      <BottomNav isAdmin={profile?.role === 'admin'} />
    </div>
  )
}
