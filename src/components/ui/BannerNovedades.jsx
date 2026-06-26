import { useState } from 'react'

const STORAGE_KEY = 'polla_novedades_v3_visto'

export default function BannerNovedades() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== 'true'
  )

  if (!visible) return null

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="bg-blue-900 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto">
        <p className="font-semibold mb-2">🆕 Novedades en la app</p>
        <ul className="text-sm space-y-1 mb-3 list-disc list-inside">
          <li>Mis Picks ahora tiene tabs por fase — no más scroll infinito</li>
          <li>Selecciona un grupo (A, B, C...) para ver la tabla de posiciones en tiempo real</li>
          <li>
            Al final de la pestaña Grupos &gt; Todos, encontrarás la tabla de Mejores Terceros con
            los 8 que clasifican al R32
          </li>
          <li>
            Cuando un partido termina y se registra el resultado, haz clic en él para ver qué
            marcador pusieron todos los participantes
          </li>
        </ul>
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            Entendido ✓
          </button>
        </div>
      </div>
    </div>
  )
}
