export const PUNTOS_CAMPEON = 10
export const PUNTOS_GOLEADOR = 5

export function calcularPuntos(prediccion, resultado) {
  const { goles_local: pl, goles_visitante: pv } = prediccion
  const { goles_local: rl, goles_visitante: rv } = resultado

  if (pl === rl && pv === rv) return 3

  const ganadorPredicho = Math.sign(pl - pv)
  const ganadorReal = Math.sign(rl - rv)
  if (ganadorPredicho === ganadorReal) return 1

  return 0
}
