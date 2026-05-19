import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function usePartidos(fase = null) {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let query = supabase
      .from('partidos')
      .select(`
        *,
        equipo_local:equipo_local_id(id, nombre, codigo, bandera_url),
        equipo_visitante:equipo_visitante_id(id, nombre, codigo, bandera_url)
      `)
      .order('fecha_hora', { ascending: true })

    if (fase) query = query.eq('fase', fase)

    setLoading(true)
    query.then(({ data, error }) => {
      if (error) setError(error.message)
      else setPartidos(data ?? [])
      setLoading(false)
    })
  }, [fase])

  return { partidos, loading, error }
}
