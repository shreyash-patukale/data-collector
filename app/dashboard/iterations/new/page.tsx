import { createServerSupabaseClient } from '@/lib/supabase-server'
import CreateIterationForm from '@/components/forms/CreateIterationForm'
import { redirect } from 'next/navigation'

export default async function NewIterationPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: setups } = await supabase.from('setups').select('*').order('setup_name')

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">New Iteration</h1>
        <p className="text-gray-500 text-sm">Start a new crop experiment cycle</p>
      </div>
      <CreateIterationForm setups={setups ?? []} userId={user.id} />
    </div>
  )
}
