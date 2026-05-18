-- =============================================================
-- Migración 002 — Row Level Security (RLS) y políticas
-- Polla del Mundial 2026
-- =============================================================

-- ---------------------------------------------------------------
-- USUARIOS
-- Cada usuario solo puede leer y editar su propio perfil.
-- ---------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------
-- PREDICCIONES
-- Regla: ver las propias siempre; ver las ajenas solo cuando
-- el partido ya está cerrado (evita spoilers antes del partido).
-- Esto también permite que la vista `ranking` calcule bien
-- los puntos totales de todos los usuarios.
-- ---------------------------------------------------------------
ALTER TABLE public.predicciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "predicciones_select" ON public.predicciones
  FOR SELECT USING (
    auth.uid() = usuario_id
    OR EXISTS (
      SELECT 1 FROM public.partidos
      WHERE id = partido_id AND predicciones_cerradas = true
    )
  );

CREATE POLICY "predicciones_insert_own" ON public.predicciones
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "predicciones_update_own" ON public.predicciones
  FOR UPDATE USING (auth.uid() = usuario_id);

-- ---------------------------------------------------------------
-- PREDICCIONES ESPECIALES
-- Solo el propio usuario puede ver y editar sus especiales.
-- ---------------------------------------------------------------
ALTER TABLE public.predicciones_especiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "especiales_select_own" ON public.predicciones_especiales
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "especiales_insert_own" ON public.predicciones_especiales
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "especiales_update_own" ON public.predicciones_especiales
  FOR UPDATE USING (auth.uid() = usuario_id);

-- ---------------------------------------------------------------
-- EQUIPOS — lectura pública, sin escritura desde el cliente
-- ---------------------------------------------------------------
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipos_select_all" ON public.equipos
  FOR SELECT USING (true);

-- ---------------------------------------------------------------
-- PARTIDOS — lectura pública; escritura solo para admins
-- ---------------------------------------------------------------
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partidos_select_all" ON public.partidos
  FOR SELECT USING (true);

CREATE POLICY "partidos_insert_admin" ON public.partidos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "partidos_update_admin" ON public.partidos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- ---------------------------------------------------------------
-- RANKING (vista) — lectura pública para anon y authenticated
-- ---------------------------------------------------------------
GRANT SELECT ON public.ranking TO anon, authenticated;
