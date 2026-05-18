import { calcularPuntos, PUNTOS_CAMPEON, PUNTOS_GOLEADOR } from '@/lib/puntuacion'

const normalize = (str) =>
  (str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Lee todas las predicciones de un partido, calcula los puntos
 * con el resultado real ya guardado y actualiza puntos_obtenidos.
 * Requiere que el partido ya tenga goles_local/goles_visitante en BD.
 */
export async function calcularYActualizarPuntos(partidoId, supabase) {
  const { data: partido, error: errP } = await supabase
    .from('partidos')
    .select('goles_local, goles_visitante')
    .eq('id', partidoId)
    .single()

  if (errP || !partido) return { error: errP?.message ?? 'Partido no encontrado', updated: 0 }

  const { data: predicciones, error: errPred } = await supabase
    .from('predicciones')
    .select('id, goles_local, goles_visitante')
    .eq('partido_id', partidoId)

  if (errPred) return { error: errPred.message, updated: 0 }
  if (!predicciones?.length) return { updated: 0 }

  const updates = predicciones.map((pred) => {
    const puntos = calcularPuntos(pred, partido)
    return supabase
      .from('predicciones')
      .update({ puntos_obtenidos: puntos })
      .eq('id', pred.id)
  })

  await Promise.all(updates)
  return { updated: predicciones.length }
}

/**
 * Compara cada predicción especial con los resultados reales
 * y actualiza puntos_campeon y puntos_goleador para todos.
 * Llamar al final del torneo desde el AdminPanel.
 */
export async function calcularPuntosEspeciales({
  campeonId,
  goleadorNombre,
  goleadorEqId,
  supabase,
}) {
  const { data: especiales, error } = await supabase
    .from('predicciones_especiales')
    .select('id, campeon_id, goleador_nombre')

  if (error) return { error: error.message, updated: 0 }
  if (!especiales?.length) return { updated: 0 }

  const normalGoleador = normalize(goleadorNombre)

  const updates = especiales.map((esp) => {
    const puntosC = esp.campeon_id === campeonId ? PUNTOS_CAMPEON : 0
    const puntosG =
      normalGoleador && normalize(esp.goleador_nombre) === normalGoleador
        ? PUNTOS_GOLEADOR
        : 0
    return supabase
      .from('predicciones_especiales')
      .update({ puntos_campeon: puntosC, puntos_goleador: puntosG })
      .eq('id', esp.id)
  })

  await Promise.all(updates)
  return { updated: especiales.length }
}
