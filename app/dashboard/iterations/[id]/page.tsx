import { createServerSupabaseClient } from '@/lib/supabase-server'
import IterationDetail from '@/components/dashboard/IterationDetail'
import { notFound, redirect } from 'next/navigation'

export default async function IterationPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: iteration } = await supabase
    .from('iterations')
    .select(`*, setups(*), users(id, name, email)`)
    .eq('id', params.id)
    .single()

  if (!iteration) notFound()

  const { data: readings } = await supabase
    .from('readings')
    .select(`*, users(id, name, email)`)
    .eq('iteration_id', params.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <IterationDetail
      iteration={iteration as any}
      readings={readings as any ?? []}
      currentUser={profile as any}
    />
  )
}
