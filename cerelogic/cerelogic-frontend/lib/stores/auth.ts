import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'


interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  
  getUserId: () => string | null
  getUserName: () => string | null
  getUserImage: () => string | null
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string, 
    password: string,
    options?: {
      emailRedirectTo?: string;
      data?: object;
      captchaToken?: string;
    }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  // Session management
  setSession: (session: Session | null) => void
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      getUserId: () => {
        const state = get()
        return state.user?.id || null
      },
      getUserName: () => {
        const state = get()
        return state.user?.user_metadata?.full_name || null
      },
      getUserImage: () => {
        const state = get()
        return state.user?.user_metadata?.avatar_url || null
      },
      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          set({ isLoading: false })
          return { error: error.message }
        }

        if (data.session) {
          get().setSession(data.session)
        }

        set({ isLoading: false })
        return {}
      },

      signUp: async (email: string, password: string, options?) => {
        set({ isLoading: true })
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: options || {} 
        })

        set({ isLoading: false })

        if (error) {
          return { error: error.message }
        }

        return {}
      },

      signOut: async () => {
        set({ isLoading: true })
        await supabase.auth.signOut()
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        })

        if (error) {
          return { error: error.message }
        }

        return {}
      },

      updatePassword: async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) {
          return { error: error.message }
        }
        return {}
      },

      setSession: (session: Session | null) => {
        set({
            user: session?.user || null,
            session,
            isAuthenticated: !!session?.user,
        })
      },

      refreshSession: async () => {
        const { data, error } = await supabase.auth.refreshSession()
        if (data.session) {
          get().setSession(data.session)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
)