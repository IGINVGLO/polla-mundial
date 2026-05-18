import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export const useAuthStore = create((set, get) => ({
  user: null,        // auth.users row
  perfil: null,      // public.usuarios row
  loading: true,

  setUser: (user) => set({ user }),
  setPerfil: (perfil) => set({ perfil }),
  setLoading: (loading) => set({ loading }),

  isAdmin: () => get().perfil?.es_admin === true,

  inicializar: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get().cargarPerfil(session.user)
    }
    set({ loading: false })

    // Escuchar cambios de sesión
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().cargarPerfil(session.user)
      } else {
        set({ user: null, perfil: null })
      }
    })
  },

  cargarPerfil: async (authUser) => {
    set({ user: authUser })
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authUser.id)
      .single()
    set({ perfil: data })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, perfil: null })
  },
}))
