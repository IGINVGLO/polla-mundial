import { useState, useMemo } from 'react'
import { usePartidos } from '@/hooks/usePartidos'
import { usePredicciones } from '@/hooks/usePredicciones'
import TarjetaPartido from '@/components/partidos/TarjetaPartido'

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

export default function Predicciones() {
  const { partidos, loading: pLoading, error: pError } = usePartidos()
  const { predicciones, loading: predLoading, upsertPrediccion } = usePredicciones()

  const fasesPresentes = useMemo(
    () => FASES_ORDEN.filter((f) => partidos.some((p) => p.fase === f)),
    [partidos]
  )
  const defaultFase = useMemo(() => detectarFaseDefault(partidos), [partidos])

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
              gruposPresentes.map((grupo) => (
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
              ))
            ) : (
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
