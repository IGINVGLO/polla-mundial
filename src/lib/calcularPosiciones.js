const GRUPOS_ORDEN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function acumularStats(stats, id, gf, gc) {
  if (!stats[id]) return
  const s = stats[id]
  s.pj++
  s.gf += gf
  s.gc += gc
  if (gf > gc) s.g++
  else if (gf === gc) s.e++
  else s.p++
}

// H2H stats among a set of tied teams — only counts games between those exact teams
function computeH2H(teams, partidos) {
  const ids = new Set(teams.map((t) => t.eq.id))
  const h2h = {}
  teams.forEach((t) => { h2h[t.eq.id] = { pts: 0, gd: 0, gf: 0 } })

  for (const p of partidos) {
    if (!ids.has(p.equipo_local_id) || !ids.has(p.equipo_visitante_id)) continue
    const gl = p.goles_local ?? 0
    const gv = p.goles_visitante ?? 0

    h2h[p.equipo_local_id].gf += gl
    h2h[p.equipo_local_id].gd += gl - gv
    if (gl > gv) h2h[p.equipo_local_id].pts += 3
    else if (gl === gv) h2h[p.equipo_local_id].pts += 1

    h2h[p.equipo_visitante_id].gf += gv
    h2h[p.equipo_visitante_id].gd += gv - gl
    if (gv > gl) h2h[p.equipo_visitante_id].pts += 3
    else if (gv === gl) h2h[p.equipo_visitante_id].pts += 1
  }
  return h2h
}

// Sort teams tied on overall pts using FIFA 2026 tiebreaker order
function sortTied(teams, partidos) {
  if (teams.length <= 1) return teams
  const h2h = computeH2H(teams, partidos)

  return [...teams].sort((a, b) => {
    const ha = h2h[a.eq.id]
    const hb = h2h[b.eq.id]
    // 1. H2H points
    if (hb.pts !== ha.pts) return hb.pts - ha.pts
    // 2. H2H goal difference
    if (hb.gd !== ha.gd) return hb.gd - ha.gd
    // 3. H2H goals scored
    if (hb.gf !== ha.gf) return hb.gf - ha.gf
    // 4. Overall goal difference
    const difA = a.gf - a.gc
    const difB = b.gf - b.gc
    if (difB !== difA) return difB - difA
    // 5. Overall goals scored
    if (b.gf !== a.gf) return b.gf - a.gf
    // 6. Fair play score — DEUDA TÉCNICA: requiere tarjetas_amarillas / tarjetas_rojas en partidos
    // 7. FIFA ranking    — DEUDA TÉCNICA: sin datos en el esquema actual
    return a.eq.nombre.localeCompare(b.eq.nombre)
  })
}

/**
 * Calculates the group standings table with full FIFA 2026 tiebreakers (H2H first).
 *
 * @param {Array} partidos  Already-filtered to resultado_registrado=true for this group.
 * @param {Array} equipos   All teams in the group: { id, nombre, codigo, ... }
 * @returns {Array}         Sorted rows: { eq, pj, g, e, p, gf, gc }
 */
export function calcularTablaGrupo(partidos, equipos) {
  const stats = {}
  equipos.forEach((eq) => {
    stats[eq.id] = { eq, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }
  })

  for (const p of partidos) {
    const gl = p.goles_local ?? 0
    const gv = p.goles_visitante ?? 0
    acumularStats(stats, p.equipo_local_id, gl, gv)
    acumularStats(stats, p.equipo_visitante_id, gv, gl)
  }

  const rows = Object.values(stats)

  // Group by total pts, then apply FIFA H2H within each tied group
  const byPts = {}
  rows.forEach((r) => {
    const pts = r.g * 3 + r.e
    if (!byPts[pts]) byPts[pts] = []
    byPts[pts].push(r)
  })

  const result = []
  Object.keys(byPts)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach((pts) => result.push(...sortTied(byPts[pts], partidos)))

  return result
}

/**
 * Computes the best third-place teams ranking across all 12 groups.
 * Only includes groups that have at least 1 resultado_registrado.
 * Uses FIFA criteria WITHOUT H2H (teams come from different groups).
 *
 * @param {Array} partidos  Grupo-fase partidos with resultado_registrado=true (pre-filtered by caller).
 * @param {Array} equipos   All teams: { id, nombre, codigo, grupo, ... }
 * @returns {Array}         Sorted terceros: { grupo, eq, pj, g, e, p, gf, gc }
 */
export function calcularMejoresTerceros(partidos, equipos) {
  const terceros = []

  for (const grupo of GRUPOS_ORDEN) {
    const eqs = equipos.filter((e) => e.grupo === grupo)
    const ps = partidos.filter((p) => p.grupo === grupo)

    if (eqs.length === 0 || ps.length === 0) continue

    const tabla = calcularTablaGrupo(ps, eqs)
    if (tabla.length >= 3) {
      terceros.push({ grupo, ...tabla[2] })
    }
  }

  // No H2H — sort by general criteria only
  return terceros.sort((a, b) => {
    const ptsA = a.g * 3 + a.e
    const ptsB = b.g * 3 + b.e
    if (ptsB !== ptsA) return ptsB - ptsA
    const difA = a.gf - a.gc
    const difB = b.gf - b.gc
    if (difB !== difA) return difB - difA
    if (b.gf !== a.gf) return b.gf - a.gf
    // Fair play / FIFA ranking: DEUDA TÉCNICA
    return a.eq.nombre.localeCompare(b.eq.nombre)
  })
}
