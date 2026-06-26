import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function calcularPosiciones(equiposGrupo, partidos) {
  const stats = {}
  equiposGrupo.forEach((eq) => {
    stats[eq.id] = { eq, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }
  })

  for (const partido of partidos) {
    const { equipo_local_id: localId, equipo_visitante_id: visitanteId } = partido
    const gl = partido.goles_local ?? 0
    const gv = partido.goles_visitante ?? 0

    if (stats[localId]) {
      stats[localId].pj++
      stats[localId].gf += gl
      stats[localId].gc += gv
      if (gl > gv) stats[localId].g++
      else if (gl === gv) stats[localId].e++
      else stats[localId].p++
    }
    if (stats[visitanteId]) {
      stats[visitanteId].pj++
      stats[visitanteId].gf += gv
      stats[visitanteId].gc += gl
      if (gv > gl) stats[visitanteId].g++
      else if (gv === gl) stats[visitanteId].e++
      else stats[visitanteId].p++
    }
  }

  return Object.values(stats).sort((a, b) => {
    const ptsA = a.g * 3 + a.e
    const ptsB = b.g * 3 + b.e
    if (ptsB !== ptsA) return ptsB - ptsA
    const difA = a.gf - a.gc
    const difB = b.gf - b.gc
    if (difB !== difA) return difB - difA
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.eq.nombre.localeCompare(b.eq.nombre)
  })
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )
}

export default function Grupos() {
  const [equipos, setEquipos] = useState([])
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [grupoActivo, setGrupoActivo] = useState('A')

  useEffect(() => {
    Promise.all([
      supabase
        .from('equipos')
        .select('id, nombre, codigo, grupo')
        .order('nombre'),
      supabase
        .from('partidos')
        .select('grupo, equipo_local_id, equipo_visitante_id, goles_local, goles_visitante')
        .eq('fase', 'grupos')
        .eq('resultado_registrado', true),
    ]).then(([{ data: eqs, error: eErr }, { data: ps, error: pErr }]) => {
      if (eErr || pErr) setError((eErr ?? pErr).message)
      setEquipos(eqs ?? [])
      setPartidos(ps ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const equiposGrupo = equipos.filter((e) => e.grupo === grupoActivo)
  const partidosGrupo = partidos.filter((p) => p.grupo === grupoActivo)
  const posiciones = calcularPosiciones(equiposGrupo, partidosGrupo)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Grupos</h1>
      <p className="text-sm text-slate-500 mb-5">
        Posiciones calculadas a partir de resultados registrados.
      </p>

      {/* Tabs de grupo */}
      <div className="flex gap-1 flex-wrap mb-6">
        {GRUPOS.map((g) => (
          <button
            key={g}
            onClick={() => setGrupoActivo(g)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              grupoActivo === g
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Tabla de posiciones */}
      <div className="card overflow-x-auto">
        <h2 className="font-bold text-slate-800 text-base mb-4">Grupo {grupoActivo}</h2>

        {posiciones.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Sin equipos en este grupo.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="pb-2 text-left pr-2">#</th>
                <th className="pb-2 text-left">Equipo</th>
                <th className="pb-2 text-center px-2">PJ</th>
                <th className="pb-2 text-center px-2">G</th>
                <th className="pb-2 text-center px-2">E</th>
                <th className="pb-2 text-center px-2">P</th>
                <th className="pb-2 text-center px-2">GF</th>
                <th className="pb-2 text-center px-2">GC</th>
                <th className="pb-2 text-center px-2">DIF</th>
                <th className="pb-2 text-center px-2 font-bold text-slate-600">Pts</th>
              </tr>
            </thead>
            <tbody>
              {posiciones.map((row, idx) => {
                const pts = row.g * 3 + row.e
                const dif = row.gf - row.gc
                let rowClass = 'border-b border-slate-100 last:border-0'
                if (idx < 2) rowClass += ' bg-green-50'
                else if (idx === 2) rowClass += ' bg-yellow-50'
                return (
                  <tr key={row.eq.id} className={rowClass}>
                    <td className="py-2.5 pr-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 font-semibold text-slate-800">
                      <span className="text-xs text-slate-400 mr-1.5">{row.eq.codigo}</span>
                      {row.eq.nombre}
                    </td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.pj}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.g}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.e}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.p}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.gf}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">{row.gc}</td>
                    <td className="py-2.5 text-center px-2 text-slate-600">
                      {dif > 0 ? `+${dif}` : dif}
                    </td>
                    <td className="py-2.5 text-center px-2 font-bold text-slate-800">{pts}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
            Clasificado directo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300" />
            Posible mejor tercero
          </span>
        </div>
      </div>
    </div>
  )
}
