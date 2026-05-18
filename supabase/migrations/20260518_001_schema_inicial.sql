-- =============================================================
-- Migración 001 — Tablas y vista ranking
-- Polla del Mundial 2026
-- =============================================================

-- ---------------------------------------------------------------
-- Tabla: usuarios (extiende auth.users de Supabase)
-- ---------------------------------------------------------------
CREATE TABLE public.usuarios (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias           TEXT NOT NULL UNIQUE,
  nombre_completo TEXT,
  avatar_url      TEXT,
  es_admin        BOOLEAN DEFAULT FALSE,
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Tabla: equipos
-- ---------------------------------------------------------------
CREATE TABLE public.equipos (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  codigo      TEXT NOT NULL UNIQUE,  -- Ej: 'COL', 'BRA', 'ARG'
  grupo       TEXT,                   -- 'A'..'H' (NULL para fases eliminatorias)
  bandera_url TEXT
);

-- ---------------------------------------------------------------
-- Tabla: partidos
-- ---------------------------------------------------------------
CREATE TABLE public.partidos (
  id                     SERIAL PRIMARY KEY,
  fase                   TEXT NOT NULL,  -- 'grupos'|'dieciseisavos'|'octavos'|'cuartos'|'semis'|'tercero'|'final'
  grupo                  TEXT,           -- Solo para fase de grupos: 'A'..'H'
  equipo_local_id        INTEGER REFERENCES public.equipos(id),
  equipo_visitante_id    INTEGER REFERENCES public.equipos(id),
  fecha_hora             TIMESTAMPTZ NOT NULL,
  estadio                TEXT,
  ciudad                 TEXT,
  -- Resultado real (lo llena el admin)
  goles_local            INTEGER,
  goles_visitante        INTEGER,
  resultado_registrado   BOOLEAN DEFAULT FALSE,
  -- Control de predicciones
  predicciones_cerradas  BOOLEAN DEFAULT FALSE
);

-- ---------------------------------------------------------------
-- Tabla: predicciones
-- ---------------------------------------------------------------
CREATE TABLE public.predicciones (
  id               SERIAL PRIMARY KEY,
  usuario_id       UUID    REFERENCES public.usuarios(id) ON DELETE CASCADE,
  partido_id       INTEGER REFERENCES public.partidos(id) ON DELETE CASCADE,
  goles_local      INTEGER NOT NULL,
  goles_visitante  INTEGER NOT NULL,
  puntos_obtenidos INTEGER DEFAULT 0,  -- Calculado al registrar resultado
  creado_en        TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, partido_id)       -- Una predicción por usuario por partido
);

-- ---------------------------------------------------------------
-- Tabla: predicciones_especiales (campeón y goleador)
-- ---------------------------------------------------------------
CREATE TABLE public.predicciones_especiales (
  id                  SERIAL PRIMARY KEY,
  usuario_id          UUID    REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  campeon_id          INTEGER REFERENCES public.equipos(id),
  goleador_nombre     TEXT,
  goleador_equipo_id  INTEGER REFERENCES public.equipos(id),
  puntos_campeon      INTEGER DEFAULT 0,
  puntos_goleador     INTEGER DEFAULT 0,
  creado_en           TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Vista: ranking
-- Suma puntos de predicciones + especiales por usuario
-- ---------------------------------------------------------------
CREATE VIEW public.ranking AS
SELECT
  u.id,
  u.alias,
  u.avatar_url,
  COALESCE(SUM(p.puntos_obtenidos), 0)
    + COALESCE(pe.puntos_campeon, 0)
    + COALESCE(pe.puntos_goleador, 0)        AS puntos_totales,
  COUNT(CASE WHEN p.puntos_obtenidos >= 3 THEN 1 END) AS resultados_exactos,
  COUNT(CASE WHEN p.puntos_obtenidos = 1  THEN 1 END) AS resultados_parciales
FROM public.usuarios u
LEFT JOIN public.predicciones p
       ON p.usuario_id = u.id
LEFT JOIN public.predicciones_especiales pe
       ON pe.usuario_id = u.id
GROUP BY u.id, u.alias, u.avatar_url, pe.puntos_campeon, pe.puntos_goleador
ORDER BY puntos_totales DESC;
