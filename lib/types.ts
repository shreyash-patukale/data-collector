export type UserRole = 'admin' | 'employee'
export type IterationStatus = 'active' | 'closed'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Setup {
  id: string
  setup_name: string
  location: string
  description: string
  plant_capacity: number
  created_at: string
}

export interface Iteration {
  id: string
  setup_id: string
  iteration_number: number
  crop_name: string
  crop_qty: number
  season: string
  created_by: string
  start_date: string
  status: IterationStatus
  closed_at: string | null
  created_at: string
  // Joined
  setups?: Setup
  users?: User
}

export interface Reading {
  id: string
  iteration_id: string
  user_id: string
  tds: number
  ph: number | null
  notes: string | null
  created_at: string
  // Joined
  users?: User
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      setups: {
        Row: Setup
        Insert: Omit<Setup, 'id' | 'created_at'>
        Update: Partial<Omit<Setup, 'id'>>
      }
      iterations: {
        Row: Iteration
        Insert: Omit<Iteration, 'id' | 'created_at' | 'setups' | 'users'>
        Update: Partial<Omit<Iteration, 'id' | 'setups' | 'users'>>
      }
      readings: {
        Row: Reading
        Insert: Omit<Reading, 'id' | 'created_at' | 'users'>
        Update: Partial<Omit<Reading, 'id' | 'users'>>
      }
    }
  }
}
