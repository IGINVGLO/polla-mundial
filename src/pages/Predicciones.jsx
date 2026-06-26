import { useState, useMemo } from 'react'
import { usePartidos } from '@/hooks/usePartidos'
import { usePredicciones } from '@/hooks/usePredicciones'
import TarjetaPartido from '@/components/partidos/TarjetaPartido'
import { calcularTablaGrupo, calcularMejoresTerceros } from '@/lib/calcularPosiciones'

const FASES_ORDEN = [
  'grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'tercero', 'final',
]
const FASES_LABEL = {
  grupos: 'Grupos',
  dieciseisavos: 'R32',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semifinal: 'Semis',
  tercero: '3er Puesto',
  final: 'Final',
}

function detectarFaseDefault(partidos) {
  if (!partidos.length) return 'grupos'
  const sinResultado = [...partidos]
    .filter((p) => !p.resultado_registrado)
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
  if (sinResultado.length > 0) return sinResultado[0].fase
  const fasesPresentes = FASES_ORDEN.filter((f) => partidos.some((p) => p.fase === f))
  return fasesPresentes[fasesPresentes.length - 1] ?? 'grupos'
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )
}

const TH_COLS = ['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DIF', 'Pts']

function TablaGrupo({ tabla, hayResultados }) {
  if (tabla.length === 0) return null
  return (
    <div className="card mb-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200">
            {TH_COLS.map((c) => (
              <th
                key={c}
                className={`pb-2 ${c === '#' || c === 'Equipo' ? 'text-left' : 'text-center px-1.5'} ${c === 'Pts' ? 'font-bold text-slate-600' : ''}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.map((row, idx) => {
            const pts = row.g * 3 + row.e
            const dif = row.gf - row.gc
            let rowClass = 'border-b border-slate-100 last:border-0'
            if (hayResultados) {
              if (idx < 2) rowClass += ' bg-green-50'
              else if (idx === 2) rowClass += ' bg-yellow-50'
            }
            return (
              <tr key={row.eq.id} className={rowClass}>
                <td className="py-2 pr-1 text-xs text-slate-400">{idx + 1}</td>
                <td className="py-2 text-xs font-medium text-slate-800 whitespace-nowrap">
                  <span className="text-slate-400 mr-1">{row.eq.codigo}</span>
                  {row.eq.nombre}
                </td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.pj}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.g}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.e}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.p}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.gf}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.gc}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">
                  {dif > 0 ? `+${dif}` : dif}
                </td>
                <td className="py-2 text-center px-1.5 text-xs font-bold text-slate-800">{pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {hayResultados && (
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300" />
            Clasifica
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300" />
            Mejor tercero
          </span>
        </div>
      )}
      <p className="text-xs text-slate-300 mt-2">
        Desempate: head-to-head → DIF → GF → Fair Play → Ranking FIFA
      </p>
    </div>
  )
}

function MejoresTerceros({ terceros }) {
  if (terceros.length === 0) return null
  const todos12 = terceros.length === 12
  return (
    <div className="card mt-8 overflow-x-auto">
      <h3 className="font-bold text-slate-800 text-base mb-1">
        🏅 Mejores Terceros — Clasificación al R32
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Los mejores 8 de los 12 terceros clasifican a la ronda de 32.
        {!todos12 && ` (${terceros.length}/12 grupos con resultados)`}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200">
            <th className="pb-2 text-left pr-1">#</th>
            <th className="pb-2 text-center px-1">Grp</th>
            <th className="pb-2 text-left">Equipo</th>
            <th className="pb-2 text-center px-1.5">PJ</th>
            <th className="pb-2 text-center px-1.5">G</th>
            <th className="pb-2 text-center px-1.5">E</th>
            <th className="pb-2 text-center px-1.5">P</th>
            <th className="pb-2 text-center px-1.5">GF</th>
            <th className="pb-2 text-center px-1.5">GC</th>
            <th className="pb-2 text-center px-1.5">DIF</th>
            <th className="pb-2 text-center px-1.5 font-bold text-slate-600">Pts</th>
            {todos12 && <th className="pb-2 text-center px-1">Estado</th>}
          </tr>
        </thead>
        <tbody>
          {terceros.map((row, idx) => {
            const pts = row.g * 3 + row.e
            const dif = row.gf - row.gc
            const clasifica = idx < 8
            const eliminado = todos12 && idx >= 8
            let rowClass = 'border-b border-slate-100 last:border-0'
            if (clasifica) rowClass += ' bg-green-50'
            else if (eliminado) rowClass += ' bg-red-50'
            return (
              <tr key={`${row.grupo}-${row.eq.id}`} className={rowClass}>
                <td className="py-2 pr-1 text-xs text-slate-400">{idx + 1}</td>
                <td className="py-2 text-center px-1 text-xs font-bold text-slate-600">{row.grupo}</td>
                <td className="py-2 text-xs font-medium text-slate-800 whitespace-nowrap">
                  <span className="text-slate-400 mr-1">{row.eq.codigo}</span>
                  {row.eq.nombre}
                </td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.pj}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.g}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.e}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.p}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.gf}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">{row.gc}</td>
                <td className="py-2 text-center px-1.5 text-xs text-slate-600">
                  {dif > 0 ? `+${dif}` : dif}
                </td>
                <td className="py-2 text-center px-1.5 text-xs font-bold text-slate-800">{pts}</td>
                {todos12 && (
                  <td className="py-2 text-center px-1">
                    {clasifica ? (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Clasifica
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Eliminado
                      </span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-slate-300 mt-3">
        Desempate: Pts → DIF → GF → Fair Play → Ranking FIFA (sin head-to-head)
      </p>
    </div>
  )
}

export default function Predicciones() {
  const { partidos, loading: pLoading, error: pError } = usePartidos()
  const { predicciones, loading: predLoading, upsertPrediccion } = usePredicciones()

  const fasesPresentes = useMemo(
    () => FASES_ORDEN.filter((f) => partidos.some((p) => p.fase === f)),
    [partidos]
  )
  const defaultFase = useMemo(() => detectarFaseDefault(partidos), [partidos])

  // Build team list from grupo-stage partidos — avoids a separate DB fetch for equipos
  const equiposDePartidos = useMemo(() => {
    const byId = {}
    partidos
      .filter((p) => p.fase === 'grupos' && p.equipo_local && p.equipo_visitante)
      .forEach((p) => {
        byId[p.equipo_local_id] = { id: p.equipo_local_id, grupo: p.grupo, ...p.equipo_local }
        byId[p.equipo_visitante_id] = { id: p.equipo_visitante_id, grupo: p.grupo, ...p.equipo_visitante }
      })
    return Object.values(byId)
  }, [partidos])

  const [faseActiva, setFaseActiva] = useState(null)
  const [grupoActivo, setGrupoActivo] = useState('Todos')

  if (pLoading || predLoading) return <Spinner />

  if (pError) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-500">{pError}</p>
      </div>
    )
  }

  const predMap = Object.fromEntries(predicciones.map((p) => [p.partido_id, p]))
  const faseReal = faseActiva ?? defaultFase
  const partidosFase = partidos.filter((p) => p.fase === faseReal)
  const gruposPresentes = faseReal === 'grupos'
    ? [...new Set(partidosFase.map((p) => p.grupo))].sort()
    : []

  const handleFase = (f) => {
    setFaseActiva(f)
    setGrupoActivo('Todos')
  }

  // Compute group tables only when in grupos tab
  let tablaGrupo = []
  let hayResultadosGrupo = false
  let mejoresTerceros = []

  if (faseReal === 'grupos') {
    if (grupoActivo !== 'Todos') {
      const equiposGrupo = equiposDePartidos.filter((e) => e.grupo === grupoActivo)
      const psConResultado = partidos.filter(
        (p) => p.fase === 'grupos' && p.grupo === grupoActivo && p.resultado_registrado
      )
      tablaGrupo = calcularTablaGrupo(psConResultado, equiposGrupo)
      hayResultadosGrupo = psConResultado.length > 0
    } else {
      const psConResultado = partidos.filter(
        (p) => p.fase === 'grupos' && p.resultado_registrado
      )
      mejoresTerceros = calcularMejoresTerceros(psConResultado, equiposDePartidos)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Mis predicciones</h1>
      <p className="text-sm text-slate-500 mb-5">
        Los partidos se bloquean automáticamente a la hora de inicio.
      </p>

      {fasesPresentes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-500">Los partidos aún no han sido cargados.</p>
        </div>
      ) : (
        <>
          {/* Tabs de fase */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
            {fasesPresentes.map((f) => (
              <button
                key={f}
                onClick={() => handleFase(f)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  faseReal === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {FASES_LABEL[f] ?? f}
              </button>
            ))}
          </div>

          {/* Filtro por grupo */}
          {faseReal === 'grupos' && gruposPresentes.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-5">
              {['Todos', ...gruposPresentes].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrupoActivo(g)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    grupoActivo === g
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g === 'Todos' ? 'Todos' : `Grupo ${g}`}
                </button>
              ))}
            </div>
          )}

          {/* Partidos */}
          {faseReal === 'grupos' ? (
            grupoActivo === 'Todos' ? (
              <>
                {gruposPresentes.map((grupo) => (
                  <section key={grupo} className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Grupo {grupo}
                    </h3>
                    {partidosFase
                      .filter((p) => p.grupo === grupo)
                      .map((partido) => (
                        <TarjetaPartido
                          key={partido.id}
                          partido={partido}
                          prediccion={predMap[partido.id] ?? null}
                          upsertPrediccion={upsertPrediccion}
                        />
                      ))}
                  </section>
                ))}
                <MejoresTerceros terceros={mejoresTerceros} />
              </>
            ) : (
              <>
                <TablaGrupo tabla={tablaGrupo} hayResultados={hayResultadosGrupo} />
                <section className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Grupo {grupoActivo}
                  </h3>
                  {partidosFase
                    .filter((p) => p.grupo === grupoActivo)
                    .map((partido) => (
                      <TarjetaPartido
                        key={partido.id}
                        partido={partido}
                        prediccion={predMap[partido.id] ?? null}
                        upsertPrediccion={upsertPrediccion}
                      />
                    ))}
                </section>
              </>
            )
          ) : (
            partidosFase.map((partido) => (
              <TarjetaPartido
                key={partido.id}
                partido={partido}
                prediccion={predMap[partido.id] ?? null}
                upsertPrediccion={upsertPrediccion}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
