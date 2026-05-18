import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabaseClient'
import { calcularYActualizarPuntos } from '@/lib/adminHelpers'

export default function PartidoAdminRow({ partido, onUpdate }) {
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [marcador, setMarcador] = useState({
    local: partido.resultado_registrado ? String(partido.goles_local) : '',
    visitante: partido.resultado_registrado ? String(partido.goles_visitante) : '',
  })
  const [guardando, setGuardando] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const mostrarForm =
    !partido.resultado_registrado || corrigiendo

  const showFeedback = (type) => {
    setFeedback(type)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleRegistrar = async () => {
    const gl = parseInt(marcador.local, 10)
    const gv = parseInt(marcador.visitante, 10)
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) return

    setGuardando(true)
    const { error } = await supabase
      .from('partidos')
      .update({
        goles_local: gl,
        goles_visitante: gv,
        resultado_registrado: true,
        predicciones_cerradas: true,
      })
      .eq('id', partido.id)

    if (error) {
      setGuardando(false)
      showFeedback('error')
      return
    }

    await calcularYActualizarPuntos(partido.id, supabase)

    onUpdate({
      ...partido,
      goles_local: gl,
      goles_visitante: gv,
      resultado_registrado: true,
      predicciones_cerradas: true,
    })
    setCorrigiendo(false)
    setGuardando(false)
    showFeedback('ok')
  }

  const handleToggleCierre = async () => {
    setToggling(true)
    const nuevo = !partido.predicciones_cerradas
    const { error } = await supabase
      .from('partidos')
      .update({ predicciones_cerradas: nuevo })
      .eq('id', partido.id)

    if (!error) onUpdate({ ...partido, predicciones_cerradas: nuevo })
    setToggling(false)
  }

  const fecha = format(new Date(partido.fecha_hora), "d MMM · HH:mm", { locale: es })

  return (
    <div className="card mb-3">
      {/* Cabecera del partido */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span>{partido.equipo_local?.nombre ?? 'TBD'}</span>
          <span className="text-slate-400 font-normal">vs</span>
          <span>{partido.equipo_visitante?.nombre ?? 'TBD'}</span>
        </div>
        <span className="text-xs text-slate-400 capitalize">{fecha}</span>
      </div>

      {/* Resultado registrado (solo lectura) */}
      {partido.resultado_registrado && !corrigiendo && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-bold text-slate-800">
            {partido.goles_local} — {partido.goles_visitante}
          </span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Registrado
          </span>
          <button
            className="text-xs text-blue-500 hover:underline ml-auto"
            onClick={() => {
              setMarcador({
                local: String(partido.goles_local),
                visitante: String(partido.goles_visitante),
              })
              setCorrigiendo(true)
            }}
          >
            Corregir
          </button>
        </div>
      )}

      {/* Formulario de resultado */}
      {mostrarForm && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number" min="0" max="20"
            className="input w-16 text-center font-bold"
            value={marcador.local}
            onChange={(e) => setMarcador((m) => ({ ...m, local: e.target.value }))}
            placeholder="0"
          />
          <span className="text-slate-400 font-bold">—</span>
          <input
            type="number" min="0" max="20"
            className="input w-16 text-center font-bold"
            value={marcador.visitante}
            onChange={(e) => setMarcador((m) => ({ ...m, visitante: e.target.value }))}
            placeholder="0"
          />
          <button
            className="btn-primary text-xs py-1.5 px-3"
            onClick={handleRegistrar}
            disabled={guardando || marcador.local === '' || marcador.visitante === ''}
          >
            {guardando ? '...' : corrigiendo ? 'Guardar corrección' : 'Registrar resultado'}
          </button>
          {corrigiendo && (
            <button
              className="btn-secondary text-xs py-1.5 px-3"
              onClick={() => setCorrigiendo(false)}
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Toggle cierre de predicciones */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-500">Predicciones cerradas</span>
        <button
          onClick={handleToggleCierre}
          disabled={toggling}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            partido.predicciones_cerradas ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              partido.predicciones_cerradas ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Feedback */}
      {feedback === 'ok' && (
        <p className="text-xs text-green-600 mt-2">✓ Guardado — puntos calculados</p>
      )}
      {feedback === 'error' && (
        <p className="text-xs text-red-500 mt-2">Error al guardar. Verifica permisos admin.</p>
      )}
    </div>
  )
}
