import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminPanel from '@/components/admin/AdminPanel'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { data: iterations },
    { data: users },
    { data: setups },
    { data: readings },
  ] = await Promise.all([
    supabase.from('iterations').select(`*, setups(*), users(id, name, email)`).order('created_at', { ascending: false }),
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('setups').select('*').order('setup_name'),
    supabase.from('readings').select(`*, users(id, name, email), iterations(crop_name, iteration_number)`).order('created_at', { ascending: false }).limit(100),
  ])

  return (
    <AdminPanel
      iterations={iterations as any ?? []}
      users={users as any ?? []}
      setups={setups as any ?? []}
      readings={readings as any ?? []}
    />
  )
}
