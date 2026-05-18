import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

export function usePredicciones() {
  const { user } = useAuthStore()
  const [predicciones, setPredicciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPredicciones = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('predicciones')
      .select('*')
      .eq('usuario_id', user.id)
    if (error) setError(error.message)
    else setPredicciones(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPredicciones()
  }, [fetchPredicciones])

  const upsertPrediccion = async (partidoId, golesLocal, golesVisitante) => {
    const { data, error } = await supabase
      .from('predicciones')
      .upsert(
        {
          usuario_id: user.id,
          partido_id: partidoId,
          goles_local: golesLocal,
          goles_visitante: golesVisitante,
          actualizado_en: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,partido_id' }
      )
      .select()
      .single()

    if (!error) {
      setPredicciones((prev) => {
        const idx = prev.findIndex((p) => p.partido_id === partidoId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = data
          return next
        }
        return [...prev, data]
      })
    }
    return { error }
  }

  return { predicciones, loading, error, fetchPredicciones, upsertPrediccion }
}
