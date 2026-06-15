import { Link } from 'react-router-dom'

const CIERRE = new Date('2026-06-19T05:00:00Z')

export default function BannerAviso() {
  if (new Date() >= CIERRE) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-300 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-yellow-800">
          ⏰ Tienes hasta el 18 de junio para elegir tu Campeón y Goleador del torneo. ¡No lo dejes para último momento!
        </p>
        <Link
          to="/predicciones-especiales"
          className="text-sm font-semibold text-yellow-800 underline shrink-0 hover:text-yellow-900"
        >
          Ir a Especiales →
        </Link>
      </div>
    </div>
  )
}
