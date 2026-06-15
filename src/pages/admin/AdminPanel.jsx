import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { calcularPuntosEspeciales } from '@/lib/adminHelpers'
import PartidoAdminRow from '@/components/admin/PartidoAdminRow'

const FASES_ORDEN = [
  'grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semis', 'tercero', 'final',
]
const FASE_LABEL = {
  grupos: 'Grupos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semis: 'Semis',
  tercero: '3er Puesto',
  final: 'Final',
}

const LINK_REGISTRO = 'https://polla-mundial-peach.vercel.app/register'
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(
  `Te invito a la Polla del Mundial 2026 🏆 Regístrate aquí: ${LINK_REGISTRO}`
)}`
const MAX_PARTICIPANTES = 40

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}

/* ── Tab: Partidos ── */
function TabPartidos({ partidos, equipos, onUpdate }) {
  const fasesPresentes = FASES_ORDEN.filter((f) => partidos.some((p) => p.fase === f))
  const [faseActiva, setFaseActiva] = useState(fasesPresentes[0] ?? 'grupos')

  const pendientes = partidos.filter((p) => !p.resultado_registrado).length
  const partidosFase = partidos.filter((p) => p.fase === faseActiva)

  return (
    <div>
      <div className="card mb-4 flex items-center gap-3">
        <span className="text-2xl font-bold text-blue-600">{pendientes}</span>
        <span className="text-slate-600 text-sm">
          {pendientes === 1 ? 'partido pendiente de resultado' : 'partidos pendientes de resultado'}
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
        {fasesPresentes.map((f) => (
          <button
            key={f}
            onClick={() => setFaseActiva(f)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              faseActiva === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {FASE_LABEL[f] ?? f}
          </button>
        ))}
      </div>

      {partidosFase.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">
          No hay partidos en esta fase todavía.
        </p>
      ) : (
        partidosFase.map((partido) => (
          <PartidoAdminRow key={partido.id} partido={partido} equipos={equipos} onUpdate={onUpdate} />
        ))
      )}
    </div>
  )
}

/* ── Tab: Predicciones Especiales ── */
function TabEspeciales({ equipos }) {
  const [form, setForm] = useState({
    campeon_id: '',
    goleador_nombre: '',
    goleador_equipo_id: '',
  })
  const [calculando, setCalculando] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCalcular = async (e) => {
    e.preventDefault()
    if (!form.campeon_id) return
    setCalculando(true)
    setFeedback(null)

    const { error, updated } = await calcularPuntosEspeciales({
      campeonId: parseInt(form.campeon_id, 10),
      goleadorNombre: form.goleador_nombre,
      goleadorEqId: form.goleador_equipo_id ? parseInt(form.goleador_equipo_id, 10) : null,
      supabase,
    })

    setCalculando(false)
    setFeedback(
      error
        ? { type: 'error', msg: `Error: ${error}` }
        : { type: 'ok', msg: `Puntos especiales calculados para ${updated} jugadores.` }
    )
  }

  return (
    <form onSubmit={handleCalcular} className="card max-w-md space-y-4">
      <p className="text-sm text-slate-500">
        Ingresa los resultados reales al finalizar el torneo. Se recalcularán los
        puntos de todos los jugadores.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          🏆 Campeón real <span className="text-red-500">*</span>
        </label>
        <select name="campeon_id" className="input" value={form.campeon_id} onChange={handleChange} required>
          <option value="">— Selecciona equipo —</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre} ({e.codigo})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">⚽ Goleador real</label>
        <input
          name="goleador_nombre"
          className="input"
          value={form.goleador_nombre}
          onChange={handleChange}
          placeholder="Nombre del jugador"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Selección del goleador</label>
        <select name="goleador_equipo_id" className="input" value={form.goleador_equipo_id} onChange={handleChange}>
          <option value="">— Selecciona equipo —</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre} ({e.codigo})</option>
          ))}
        </select>
      </div>

      {feedback && (
        <p className={`text-sm px-3 py-2 rounded-lg ${
          feedback.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {feedback.msg}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={calculando}>
        {calculando ? 'Calculando...' : 'Calcular puntos especiales'}
      </button>

      <p className="text-xs text-slate-400">
        Esta acción sobreescribe los puntos especiales existentes. Se puede
        ejecutar varias veces si hay correcciones.
      </p>
    </form>
  )
}

/* ── Tab: Invitaciones ── */
function TabInvitaciones() {
  const [copiado, setCopiado] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('usuarios')
      .select('alias, nombre_completo, creado_en, es_admin')
      .order('creado_en', { ascending: true })
      .then(({ data }) => {
        setUsuarios(data ?? [])
        setLoading(false)
      })
  }, [])

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(LINK_REGISTRO)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Link de invitación */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-slate-800">Invita participantes</h3>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="text-sm text-slate-600 truncate flex-1">{LINK_REGISTRO}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopiar}
            className={`btn-primary text-sm px-4 py-2 transition-all ${copiado ? 'bg-green-600 hover:bg-green-600' : ''}`}
          >
            {copiado ? '¡Copiado! ✓' : '📋 Copiar link'}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm px-4 py-2"
          >
            💬 Compartir por WhatsApp
          </a>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Participantes registrados</h3>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            usuarios.length >= MAX_PARTICIPANTES
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {usuarios.length} / {MAX_PARTICIPANTES}
          </span>
        </div>

        {loading ? (
          <Spinner />
        ) : usuarios.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Aún no hay participantes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="pb-2 pr-4">Alias</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Nombre</th>
                  <th className="pb-2 pr-4 hidden md:table-cell">Registro</th>
                  <th className="pb-2 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.alias} className="hover:bg-slate-50">
                    <td className="py-2 pr-4 font-medium text-slate-800">{u.alias}</td>
                    <td className="py-2 pr-4 text-slate-600 hidden sm:table-cell">
                      {u.nombre_completo ?? '—'}
                    </td>
                    <td className="py-2 pr-4 text-slate-400 hidden md:table-cell">
                      {new Date(u.creado_en).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 text-center">
                      {u.es_admin ? (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                          Admin
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Componente principal ── */
export default function AdminPanel() {
  const [tab, setTab] = useState('partidos')
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipo_local_id(id, nombre, codigo),
          equipo_visitante:equipo_visitante_id(id, nombre, codigo)
        `)
        .order('fecha_hora'),
      supabase.from('equipos').select('id, nombre, codigo').order('nombre'),
    ]).then(([{ data: ps }, { data: eqs }]) => {
      setPartidos(ps ?? [])
      setEquipos(eqs ?? [])
      setLoading(false)
    })
  }, [])

  const handleUpdate = (updatedPartido) => {
    setPartidos((prev) =>
      prev.map((p) => (p.id === updatedPartido.id ? updatedPartido : p))
    )
  }

  const tabs = [
    { id: 'partidos', label: '⚽ Partidos' },
    { id: 'especiales', label: '⭐ Especiales' },
    { id: 'invitaciones', label: '📨 Invitaciones' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Panel de administración
      </h1>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'invitaciones' ? (
        <TabInvitaciones />
      ) : loading ? (
        <Spinner />
      ) : tab === 'partidos' ? (
        <TabPartidos partidos={partidos} equipos={equipos} onUpdate={handleUpdate} />
      ) : (
        <TabEspeciales equipos={equipos} />
      )}
    </div>
  )
}
