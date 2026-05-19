import { useAuthStore } from '@/store/authStore'

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

export default function Home() {
  const { perfil } = useAuthStore()

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        ¡Hola, {perfil?.alias ?? 'jugador'}! 👋
      </h1>
      <p className="text-slate-500 mb-8">Bienvenido a la Polla del Mundial 2026</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card text-center">
          <div className="text-4xl mb-2">⚽</div>
          <h2 className="font-semibold text-slate-900">Mis predicciones</h2>
          <p className="text-sm text-slate-500 mt-1">Llena tus picks antes de cada partido</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="font-semibold text-slate-900">Ranking</h2>
          <p className="text-sm text-slate-500 mt-1">Mira cómo vas vs el grupo</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">⭐</div>
          <h2 className="font-semibold text-slate-900">Especiales</h2>
          <p className="text-sm text-slate-500 mt-1">Campeón y goleador del torneo</p>
        </div>
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
