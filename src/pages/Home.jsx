import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import { usePartidos } from '@/hooks/usePartidos'
import { usePredicciones } from '@/hooks/usePredicciones'
import { useRanking } from '@/hooks/useRanking'

const PUNTUACION = [
  {
    icono: '🎯',
    acierto: 'Marcador exacto',
    ejemplo: 'predices 2-1 y queda 2-1',
    puntos: '3 pts',
    bg: 'bg-blue-50',
    badge: 'bg-blue-600 text-white',
  },
  {
    icono: '✅',
    acierto: 'Solo ganador o empate correcto',
    ejemplo: 'predices 2-1 y queda 1-0',
    puntos: '1 pt',
    bg: 'bg-slate-50',
    badge: 'bg-slate-500 text-white',
  },
  {
    icono: '🏆',
    acierto: 'Campeón del torneo acertado',
    ejemplo: 'predicción especial',
    puntos: '10 pts',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-500 text-white',
  },
  {
    icono: '⚽',
    acierto: 'Goleador del torneo acertado',
    ejemplo: 'predicción especial',
    puntos: '5 pts',
    bg: 'bg-green-50',
    badge: 'bg-green-600 text-white',
  },
]

function TarjetaEstadistica({ icono, label, valor, colorClase, loading }) {
  return (
    <div className="card text-center py-4">
      <div className="text-3xl mb-1">{icono}</div>
      <div className={`text-xl font-bold ${colorClase}`}>
        {loading ? (
          <span className="inline-block w-12 h-6 bg-slate-200 rounded animate-pulse" />
        ) : (
          valor
        )}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}

export default function Home() {
  const { perfil, user } = useAuthStore()
  const { partidos, loading: partidosLoading } = usePartidos()
  const { predicciones, loading: predLoading } = usePredicciones()
  const { ranking, loading: rankingLoading } = useRanking()

  const loadingResumen = partidosLoading || predLoading || rankingLoading

  const predMapSet = new Set(predicciones.map((p) => p.partido_id))
  const predMapFull = new Map(predicciones.map((p) => [p.partido_id, p]))
  const ahora = new Date()
  const partidosAbiertos = partidos.filter(
    (p) => !p.predicciones_cerradas && new Date(p.fecha_hora) > ahora
  )
  const pendientes = partidosAbiertos.filter((p) => !predMapSet.has(p.id)).length
  const posicion = ranking.findIndex((r) => r.id === user?.id) + 1

  const partidosHoy = partidos.filter((p) => {
    const fechaPartido = new Date(p.fecha_hora)
    return fechaPartido.toDateString() === ahora.toDateString()
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        ¡Hola, {perfil?.alias ?? 'jugador'}! 👋
      </h1>
      <p className="text-slate-500 mb-8">Bienvenido a la Polla del Mundial 2026</p>

      {/* Partidos de hoy */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Partidos de hoy</h2>
        {loadingResumen ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card py-3 px-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : partidosHoy.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay partidos hoy.</p>
        ) : (
          <div className="space-y-3">
            {partidosHoy.map((partido) => {
              const fechaHora = new Date(partido.fecha_hora)
              const esFuturo = fechaHora > ahora
              const localNombre = partido.equipo_local?.nombre ?? 'Por definir'
              const visitanteNombre = partido.equipo_visitante?.nombre ?? 'Por definir'
              const prediccion = predMapFull.get(partido.id)

              return (
                <div key={partido.id} className="card py-3 px-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-slate-900 text-sm leading-tight">
                      {localNombre}{' '}
                      <span className="text-slate-400 font-normal">vs</span>{' '}
                      {visitanteNombre}
                    </div>
                    {partido.resultado_registrado ? (
                      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {partido.goles_local} — {partido.goles_visitante}
                      </span>
                    ) : esFuturo ? (
                      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Hoy a las {format(fechaHora, 'h:mm a', { locale: es })}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        En curso
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {partido.estadio} · {partido.ciudad}
                  </p>
                  {prediccion ? (
                    <p className="text-xs text-slate-400 mt-1.5">
                      Tu pick: {prediccion.goles_local}-{prediccion.goles_visitante}
                    </p>
                  ) : esFuturo ? (
                    <Link
                      to="/predicciones"
                      className="inline-block mt-1.5 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Predecir →
                    </Link>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Resumen personal */}
      <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          <TarjetaEstadistica
            icono="📋"
            label="Partidos por predecir"
            valor={pendientes}
            colorClase={pendientes > 0 ? 'text-orange-500' : 'text-green-600'}
            loading={loadingResumen}
          />
          <TarjetaEstadistica
            icono="✅"
            label="Predicciones guardadas"
            valor={`${predicciones.length} de ${partidos.length}`}
            colorClase="text-blue-600"
            loading={loadingResumen}
          />
          <TarjetaEstadistica
            icono="🥇"
            label="Tu posición en el ranking"
            valor={posicion > 0 ? `#${posicion} de ${ranking.length}` : '—'}
            colorClase="text-amber-500"
            loading={loadingResumen}
          />
        </div>

        {!loadingResumen && (
          pendientes > 0 ? (
            <Link to="/predicciones" className="btn-primary inline-block text-sm">
              Ir a predecir →
            </Link>
          ) : (
            <p className="text-sm font-semibold text-green-600">¡Estás al día! ✓</p>
          )
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/predicciones" className="card text-center hover:shadow-md transition-shadow">
          <div className="text-4xl mb-2">⚽</div>
          <h2 className="font-semibold text-slate-900">Mis predicciones</h2>
          <p className="text-sm text-slate-500 mt-1">Llena tus picks antes de cada partido</p>
        </Link>
        <Link to="/ranking" className="card text-center hover:shadow-md transition-shadow">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="font-semibold text-slate-900">Ranking</h2>
          <p className="text-sm text-slate-500 mt-1">Mira cómo vas vs el grupo</p>
        </Link>
        <Link to="/predicciones-especiales" className="card text-center hover:shadow-md transition-shadow">
          <div className="text-4xl mb-2">⭐</div>
          <h2 className="font-semibold text-slate-900">Especiales</h2>
          <p className="text-sm text-slate-500 mt-1">Campeón y goleador del torneo</p>
        </Link>
      </div>

      {/* Sección puntuación */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-4">🏆 ¿Cómo se puntúa?</h2>

        <div className="space-y-2">
          {PUNTUACION.map(({ icono, acierto, ejemplo, puntos, bg, badge }) => (
            <div
              key={acierto}
              className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 ${bg}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{icono}</span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm leading-tight">{acierto}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{ejemplo}</p>
                </div>
              </div>
              <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${badge}`}>
                {puntos}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Las predicciones se cierran automáticamente al inicio de cada partido
        </p>
      </div>
    </div>
  )
}
