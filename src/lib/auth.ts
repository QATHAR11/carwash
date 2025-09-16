import { supabase } from './supabase'
import { User } from '@/types'

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Get user profile
  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as 'admin' | 'staff'
    } as User
  }

  return null
}

export const signUp = async (email: string, password: string, name: string, role: 'admin' | 'staff' = 'staff') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
      })

    if (profileError) throw profileError
  }

  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as 'admin' | 'staff'
  }
}