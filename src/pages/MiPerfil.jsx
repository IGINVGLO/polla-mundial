import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

export default function MiPerfil() {
  const { user, perfil, setPerfil } = useAuthStore()

  const [form, setForm] = useState({ alias: '', nombre_completo: '' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'ok'|'error', msg: string }

  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Inicializar formulario desde el perfil del store
  useEffect(() => {
    if (perfil) {
      setForm({
        alias: perfil.alias ?? '',
        nombre_completo: perfil.nombre_completo ?? '',
      })
    }
  }, [perfil])

  // Cargar estadísticas del usuario
  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('predicciones')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', user.id),
      supabase
        .from('ranking')
        .select('puntos_totales, resultados_exactos, resultados_parciales')
        .eq('id', user.id)
        .single(),
    ]).then(([{ count }, { data: rankRow }]) => {
      setStats({
        predicciones: count ?? 0,
        puntos: rankRow?.puntos_totales ?? 0,
        exactos: rankRow?.resultados_exactos ?? 0,
        parciales: rankRow?.resultados_parciales ?? 0,
      })
      setStatsLoading(false)
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

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi perfil</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Puntos', value: stats?.puntos },
          { label: 'Predicciones', value: stats?.predicciones },
          { label: 'Exactos', value: stats?.exactos },
          { label: 'Parciales', value: stats?.parciales },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-3">
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? (
                <span className="inline-block w-8 h-6 bg-slate-200 rounded animate-pulse" />
              ) : (
                value ?? 0
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

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
    </div>
  )
}
