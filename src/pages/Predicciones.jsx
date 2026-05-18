import { usePartidos } from '@/hooks/usePartidos'
import { usePredicciones } from '@/hooks/usePredicciones'
import TarjetaPartido from '@/components/partidos/TarjetaPartido'

const FASES_ORDEN = [
  'grupos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semis',
  'tercero',
  'final',
]

const FASES_LABEL = {
  grupos: 'Fase de Grupos',
  dieciseisavos: 'Dieciseisavos de Final',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semis: 'Semifinales',
  tercero: 'Tercer Puesto',
  final: 'Final',
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

  if (pLoading || predLoading) return <Spinner />

  if (pError) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-500">{pError}</p>
      </div>
    )
  }

  // Mapa rápido para buscar predicción por partido
  const predMap = Object.fromEntries(predicciones.map((p) => [p.partido_id, p]))

  // Fases presentes en el data, ordenadas
  const fasesPresentes = FASES_ORDEN.filter((f) => partidos.some((p) => p.fase === f))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Mis predicciones</h1>
      <p className="text-sm text-slate-500 mb-8">
        Los partidos se bloquean automáticamente a la hora de inicio.
      </p>

      {fasesPresentes.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-500">Los partidos aún no han sido cargados.</p>
        </div>
      )}

      {fasesPresentes.map((fase) => {
        const partidosFase = partidos.filter((p) => p.fase === fase)

        return (
          <section key={fase} className="mb-10">
            <h2 className="text-base font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2 mb-5">
              {FASES_LABEL[fase] ?? fase}
            </h2>

            {fase === 'grupos' ? (
              // Sub-agrupar por letra de grupo
              [...new Set(partidosFase.map((p) => p.grupo))].sort().map((grupo) => (
                <div key={grupo} className="mb-6">
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
                </div>
              ))
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
          </section>
        )
      })}
    </div>
  )
}
