import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'
import { useRanking } from '@/hooks/useRanking'

function Skeleton() {
  return <span className="inline-block w-12 h-6 bg-slate-200 rounded animate-pulse" />
}

export default function MiPerfil() {
  const { user, perfil, setPerfil } = useAuthStore()
  const { ranking, loading: rankingLoading } = useRanking()

  const [form, setForm] = useState({ alias: '', nombre_completo: '' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'ok'|'error', msg: string }

  const [especial, setEspecial] = useState(null)
  const [especialLoading, setEspecialLoading] = useState(true)

  // Inicializar formulario desde el perfil del store
  useEffect(() => {
    if (perfil) {
      setForm({
        alias: perfil.alias ?? '',
        nombre_completo: perfil.nombre_completo ?? '',
      })
    }
  }, [perfil])

  // Cargar predicción especial del usuario
  useEffect(() => {
    if (!user) return
    supabase
      .from('predicciones_especiales')
      .select('goleador_nombre, campeon:campeon_id(nombre)')
      .eq('usuario_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setEspecial(data ?? null)
        setEspecialLoading(false)
      })
  }, [user])

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    setSaving(true)

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        alias: form.alias.trim(),
        nombre_completo: form.nombre_completo.trim() || null,
      })
      .eq('id', user.id)
      .select()
      .single()

    setSaving(false)

    if (error) {
      setFeedback({ type: 'error', msg: error.message })
    } else {
      setPerfil(data)
      setFeedback({ type: 'ok', msg: 'Perfil actualizado correctamente' })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const posicion = ranking.findIndex((r) => r.id === user?.id) + 1
  const miFila = posicion > 0 ? ranking[posicion - 1] : null

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi perfil</h1>

      {/* Formulario */}
      <form onSubmit={handleSave} className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Editar datos</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            className="input bg-slate-50 cursor-not-allowed text-slate-500"
            value={user?.email ?? ''}
            readOnly
          />
          <p className="text-xs text-slate-400 mt-1">El email no se puede cambiar desde aquí.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Alias <span className="text-slate-400 font-normal">(visible en el ranking)</span>
          </label>
          <input
            name="alias"
            className="input"
            value={form.alias}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
          <input
            name="nombre_completo"
            className="input"
            value={form.nombre_completo}
            onChange={handleChange}
            maxLength={80}
            placeholder="Opcional"
          />
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
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Estadísticas */}
      <div className="mt-8">
        <h2 className="font-semibold text-slate-800 mb-3">Tus estadísticas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card text-center py-4">
            <div className="text-2xl mb-1">🥇</div>
            <div className="text-xl font-bold text-amber-500">
              {rankingLoading ? <Skeleton /> : posicion > 0 ? `#${posicion} de ${ranking.length}` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Posición en el ranking</div>
          </div>

          <div className="card text-center py-4">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl font-bold text-blue-600">
              {rankingLoading ? <Skeleton /> : miFila?.puntos_totales ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Puntos totales</div>
          </div>

          <div className="card text-center py-4">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xl font-bold text-green-600">
              {rankingLoading ? <Skeleton /> : miFila?.resultados_exactos ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Resultados exactos</div>
          </div>

          <div className="card text-center py-4">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xl font-bold text-slate-600">
              {rankingLoading ? <Skeleton /> : miFila?.resultados_parciales ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Resultados parciales</div>
          </div>

          <div className="card sm:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <span>⭐</span> Predicción especial
            </h3>
            {especialLoading ? (
              <Skeleton />
            ) : especial ? (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Campeón
                  </dt>
                  <dd className="font-semibold text-slate-800">
                    {especial.campeon?.nombre ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Goleador
                  </dt>
                  <dd className="font-semibold text-slate-800">
                    {especial.goleador_nombre || '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400 italic">No registrada aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
