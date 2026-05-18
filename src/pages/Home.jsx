import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const { perfil } = useAuthStore()

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        ¡Hola, {perfil?.alias ?? 'jugador'}! 👋
      </h1>
      <p className="text-slate-500 mb-8">Bienvenido a la Polla del Mundial 2026</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  )
}
