import { createClient } from '@/lib/supabase-client'
import type { Setup } from '@/lib/types'

export const setupService = {
  async getAll(): Promise<Setup[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setups')
      .select('*')
      .order('setup_name')
    if (error) throw error
    return data as Setup[]
  },

  async getById(id: string): Promise<Setup> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setups')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Setup
  },

  async create(payload: Omit<Setup, 'id' | 'created_at'>): Promise<Setup> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setups')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as Setup
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('setups')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
