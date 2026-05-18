import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TarjetaPartido({ partido, prediccion, upsertPrediccion }) {
  const cerrado =
    partido.predicciones_cerradas || new Date() >= new Date(partido.fecha_hora)

  const [local, setLocal] = useState(
    prediccion != null ? String(prediccion.goles_local) : ''
  )
  const [visitante, setVisitante] = useState(
    prediccion != null ? String(prediccion.goles_visitante) : ''
  )
  const [guardando, setGuardando] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'ok' | 'error'

  const fechaStr = format(new Date(partido.fecha_hora), "d MMM yyyy · HH:mm", { locale: es })

  const handleGuardar = async () => {
    const gl = parseInt(local, 10)
    const gv = parseInt(visitante, 10)
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) return

    setGuardando(true)
    const { error } = await upsertPrediccion(partido.id, gl, gv)
    setGuardando(false)
    setFeedback(error ? 'error' : 'ok')
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="card mb-3">
      {/* Equipos */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex-1 text-right font-semibold text-slate-800 text-sm">
          {partido.equipo_local?.nombre ?? 'Por definir'}
        </span>
        <span className="text-xs font-bold text-slate-400 shrink-0">vs</span>
        <span className="flex-1 text-left font-semibold text-slate-800 text-sm">
          {partido.equipo_visitante?.nombre ?? 'Por definir'}
        </span>
      </div>

      {/* Fecha y lugar */}
      <p className="text-xs text-slate-500 text-center mb-3 capitalize">
        {fechaStr}
        {partido.estadio ? ` · ${partido.estadio}` : ''}
        {partido.ciudad ? `, ${partido.ciudad}` : ''}
      </p>

      {/* Inputs o vista solo lectura */}
      {cerrado ? (
        <div className="text-center">
          {prediccion != null ? (
            <div className="inline-flex items-center gap-2">
              <span className="font-bold text-slate-700 text-lg">
                {prediccion.goles_local} — {prediccion.goles_visitante}
              </span>
              {prediccion.puntos_obtenidos > 0 && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  +{prediccion.puntos_obtenidos} pts
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">Sin predicción</span>
          )}
          <p className="text-xs text-slate-400 mt-1">Partido cerrado</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <input
            type="number"
            min="0"
            max="20"
            className="input w-16 text-center text-lg font-bold px-1"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="0"
          />
          <span className="text-slate-400 font-bold text-lg">—</span>
          <input
            type="number"
            min="0"
            max="20"
            className="input w-16 text-center text-lg font-bold px-1"
            value={visitante}
            onChange={(e) => setVisitante(e.target.value)}
            placeholder="0"
          />
          <button
            className="btn-primary text-sm py-1.5 px-3 ml-1"
            onClick={handleGuardar}
            disabled={guardando || local === '' || visitante === ''}
          >
            {guardando ? '...' : prediccion ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {feedback === 'ok' && (
        <p className="text-center text-xs text-green-600 mt-2">✓ Guardado</p>
      )}
      {feedback === 'error' && (
        <p className="text-center text-xs text-red-500 mt-2">Error al guardar, intenta de nuevo</p>
      )}
    </div>
  )
}
