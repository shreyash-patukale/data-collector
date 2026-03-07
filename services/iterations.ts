import { createClient } from '@/lib/supabase-client'
import type { Iteration, Reading } from '@/lib/types'

export const iterationService = {
  async getAll(): Promise<Iteration[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('iterations')
      .select(`*, setups(*), users(id, name, email)`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Iteration[]
  },

  async getActive(): Promise<Iteration[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('iterations')
      .select(`*, setups(*), users(id, name, email)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Iteration[]
  },

  async getById(id: string): Promise<Iteration> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('iterations')
      .select(`*, setups(*), users(id, name, email)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Iteration
  },

  async create(payload: {
    setup_id: string
    iteration_number: number
    crop_name: string
    crop_qty: number
    season: string
    start_date: string
    created_by: string
  }): Promise<Iteration> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('iterations')
      .insert({ ...payload, status: 'active' })
      .select()
      .single()
    if (error) throw error
    return data as Iteration
  },

  async close(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('iterations')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async reopen(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('iterations')
      .update({ status: 'active', closed_at: null })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('iterations')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

export const readingService = {
  async getByIteration(iterationId: string): Promise<Reading[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('readings')
      .select(`*, users(id, name, email)`)
      .eq('iteration_id', iterationId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Reading[]
  },

  async create(payload: {
    iteration_id: string
    user_id: string
    tds: number
    ph?: number | null
    notes?: string | null
  }): Promise<Reading> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('readings')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as Reading
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
