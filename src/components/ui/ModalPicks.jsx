import { useEffect, useRef } from 'react'

export default function ModalPicks({ picks, partido, userId, loading, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const hayResultado = partido.resultado_registrado

  const ordenados = [...(picks ?? [])].sort((a, b) => {
    if (hayResultado) return (b.puntos_obtenidos ?? 0) - (a.puntos_obtenidos ?? 0)
    return (a.usuarios?.alias ?? '').localeCompare(b.usuarios?.alias ?? '')
  })

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                Picks — {partido.equipo_local?.nombre ?? 'Por definir'} vs{' '}
                {partido.equipo_visitante?.nombre ?? 'Por definir'}
              </h2>
              {hayResultado && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Resultado: {partido.goles_local} — {partido.goles_visitante}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none shrink-0 mt-0.5"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : ordenados.length === 0 ? (
            <p className="text-center text-slate-400 italic text-sm py-10">
              Nadie hizo predicción para este partido
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-2.5 text-left">Participante</th>
                  <th className="px-3 py-2.5 text-center">Predicción</th>
                  <th className="px-5 py-2.5 text-center">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((p, i) => {
                  const esYo = p.usuario_id === userId
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-50 last:border-0 ${
                        esYo ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-5 py-2.5 font-medium text-slate-800">
                        {p.usuarios?.alias ?? '—'}
                        {esYo && (
                          <span className="ml-1.5 text-xs text-blue-500 font-normal">(tú)</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                        {p.goles_local} — {p.goles_visitante}
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        {hayResultado ? (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              p.puntos_obtenidos > 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {p.puntos_obtenidos > 0 ? `+${p.puntos_obtenidos}` : '0'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0 text-right">
          <button onClick={onClose} className="btn-secondary text-sm py-1.5 px-4">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
