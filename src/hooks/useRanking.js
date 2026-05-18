import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useRanking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('ranking')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRanking(data ?? [])
        setLoading(false)
      })
  }, [])

  return { ranking, loading, error }
}
