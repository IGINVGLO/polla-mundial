import { useRanking } from '@/hooks/useRanking'
import { useAuthStore } from '@/store/authStore'

const MEDALLAS = ['🥇', '🥈', '🥉']

const ROW_BG = {
  0: 'bg-amber-50',
  1: 'bg-slate-50',
  2: 'bg-orange-50/60',
}

function SkeletonRows() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i}>
      <td className="px-4 py-3" colSpan={5}>
        <div
          className="h-4 bg-slate-200 rounded animate-pulse"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      </td>
    </tr>
  ))
}

function Avatar({ alias, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={alias} className="w-7 h-7 rounded-full object-cover shrink-0" />
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
      {alias?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function Ranking() {
  const { ranking, loading, error } = useRanking()
  const { user } = useAuthStore()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Ranking</h1>
      <p className="text-sm text-slate-500 mb-6">
        Actualizado en tiempo real al registrar resultados.
      </p>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                #
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Pts
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">
                Exactos
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">
                Parciales
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <SkeletonRows />
            ) : (
              ranking.map((row, idx) => {
                const esMio = row.id === user?.id
                const bg = esMio
                  ? 'bg-blue-50'
                  : ROW_BG[idx] ?? ''

                return (
                  <tr key={row.id} className={`transition-colors ${bg}`}>
                    <td className="px-4 py-3 text-center font-bold text-slate-600 text-base">
                      {MEDALLAS[idx] ?? idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar alias={row.alias} avatarUrl={row.avatar_url} />
                        <span className={`${esMio ? 'font-semibold text-blue-700' : 'text-slate-800'}`}>
                          {row.alias}
                        </span>
                        {esMio && (
                          <span className="text-xs text-blue-400 font-medium">(tú)</span>
                        )}
                        {esMio && (
                          <button
                            onClick={() => {
                              const mensaje = encodeURIComponent(
                                `Voy #${idx + 1} en la Polla del Mundial 2026 con ${row.puntos_totales} puntos 🏆\n¿Te animas? Entra aquí: https://polla-mundial-peach.vercel.app`
                              )
                              window.open(`https://wa.me/?text=${mensaje}`, '_blank')
                            }}
                            className="ml-auto bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                          >
                            Compartir 📲
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {row.puntos_totales}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">
                      {row.resultados_exactos}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">
                      {row.resultados_parciales}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!loading && error && (
          <p className="text-center text-red-500 text-sm py-6">{error}</p>
        )}
        {!loading && !error && ranking.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-slate-500 text-sm">Nadie en el ranking todavía.</p>
          </div>
        )}
      </div>
    </div>
  )
}
