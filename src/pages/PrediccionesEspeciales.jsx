import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

// 11 jun 2026 · 14:00 hora Colombia (UTC-5) = 19:00 UTC
const CIERRE_ESPECIALES = new Date('2026-06-11T19:00:00Z')

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )
}

export default function PrediccionesEspeciales() {
  const { user } = useAuthStore()
  const [equipos, setEquipos] = useState([])
  const [prediccion, setPrediccion] = useState(null)
  const [form, setForm] = useState({
    campeon_id: '',
    goleador_nombre: '',
    goleador_equipo_id: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const cerrado = new Date() >= CIERRE_ESPECIALES

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('equipos').select('id, nombre, codigo').order('nombre'),
      supabase
        .from('predicciones_especiales')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle(),
    ]).then(([{ data: eqs }, { data: pred }]) => {
      setEquipos(eqs ?? [])
      if (pred) {
        setPrediccion(pred)
        setForm({
          campeon_id: pred.campeon_id ? String(pred.campeon_id) : '',
          goleador_nombre: pred.goleador_nombre ?? '',
          goleador_equipo_id: pred.goleador_equipo_id ? String(pred.goleador_equipo_id) : '',
        })
      }
      setLoading(false)
    })
  }, [user])

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.campeon_id) return
    setSaving(true)
    setFeedback(null)

    const payload = {
      usuario_id: user.id,
      campeon_id: parseInt(form.campeon_id, 10),
      goleador_nombre: form.goleador_nombre.trim() || null,
      goleador_equipo_id: form.goleador_equipo_id
        ? parseInt(form.goleador_equipo_id, 10)
        : null,
    }

    const { data, error } = await supabase
      .from('predicciones_especiales')
      .upsert(payload, { onConflict: 'usuario_id' })
      .select()
      .single()

    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', msg: error.message })
    } else {
      setPrediccion(data)
      setFeedback({ type: 'ok', msg: '¡Predicción especial guardada!' })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const campeonSeleccionado = equipos.find((e) => e.id === parseInt(form.campeon_id))

  if (loading) return <Spinner />

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Predicciones especiales ⭐</h1>
      <p className="text-sm text-slate-500 mb-6">
        Cierre: <strong>11 junio 2026 · 14:00</strong> hora Colombia
      </p>

      {/* Puntaje obtenido (si ya hay resultado) */}
      {prediccion &&
        (prediccion.puntos_campeon > 0 || prediccion.puntos_goleador > 0) && (
          <div className="card bg-green-50 border-green-200 mb-4 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-semibold text-green-800">
                +{prediccion.puntos_campeon + prediccion.puntos_goleador} puntos especiales
              </p>
              <p className="text-xs text-green-600">
                {prediccion.puntos_campeon > 0 && `Campeón ✓ (+${prediccion.puntos_campeon}) `}
                {prediccion.puntos_goleador > 0 && `Goleador ✓ (+${prediccion.puntos_goleador})`}
              </p>
            </div>
          </div>
        )}

      {cerrado ? (
        /* ── VISTA CERRADA ── */
        <div className="card">
          <div className="flex items-center gap-2 mb-5 text-amber-700">
            <span className="text-xl">🔒</span>
            <span className="font-semibold">Predicciones especiales cerradas</span>
          </div>
          {prediccion ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                  Campeón
                </dt>
                <dd className="font-semibold text-slate-800">
                  {equipos.find((e) => e.id === prediccion.campeon_id)?.nombre ?? '—'}
                  <span className="text-slate-400 font-normal ml-1 text-xs">
                    ({equipos.find((e) => e.id === prediccion.campeon_id)?.codigo})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                  Goleador
                </dt>
                <dd className="font-semibold text-slate-800">
                  {prediccion.goleador_nombre || '—'}
                  {prediccion.goleador_equipo_id && (
                    <span className="text-slate-400 font-normal ml-1 text-xs">
                      (
                      {equipos.find((e) => e.id === prediccion.goleador_equipo_id)
                        ?.codigo ?? ''}
                      )
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-400 italic text-sm">
              No ingresaste predicciones especiales antes del cierre.
            </p>
          )}
        </div>
      ) : (
        /* ── FORMULARIO ACTIVO ── */
        <form onSubmit={handleSave} className="card space-y-5">
          {/* Campeón */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              🏆 Campeón del torneo{' '}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="campeon_id"
              className="input"
              value={form.campeon_id}
              onChange={handleChange}
              required
            >
              <option value="">— Selecciona un equipo —</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.codigo})
                </option>
              ))}
            </select>
            {campeonSeleccionado && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                ✓ {campeonSeleccionado.nombre} ({campeonSeleccionado.codigo})
              </p>
            )}
          </div>

          {/* Goleador — nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ⚽ Goleador del torneo
            </label>
            <input
              name="goleador_nombre"
              className="input"
              value={form.goleador_nombre}
              onChange={handleChange}
              placeholder="Nombre del jugador"
              maxLength={80}
            />
          </div>

          {/* Goleador — equipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Selección del goleador
            </label>
            <select
              name="goleador_equipo_id"
              className="input"
              value={form.goleador_equipo_id}
              onChange={handleChange}
            >
              <option value="">— Selecciona equipo —</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.codigo})
                </option>
              ))}
            </select>
          </div>

          {feedback && (
            <p
              className={`text-sm px-3 py-2 rounded-lg ${
                feedback.type === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {feedback.msg}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving
              ? 'Guardando...'
              : prediccion
              ? 'Actualizar predicción especial'
              : 'Guardar predicción especial'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Campeón correcto = <strong>10 pts</strong> · Goleador correcto ={' '}
            <strong>5 pts</strong> · Puedes editar hasta el cierre.
          </p>
        </form>
      )}
    </div>
  )
}
