-- =============================================================
-- Migración 006 — GRANTs de acceso a tablas y secuencias
-- Polla del Mundial 2026
--
-- En PostgreSQL, RLS y GRANTs son capas independientes.
-- Sin GRANT, el rol ni siquiera puede intentar leer la tabla,
-- independientemente de las políticas RLS.
-- =============================================================

-- ---------------------------------------------------------------
-- Lectura pública (anon + authenticated)
-- partidos y equipos son datos de solo lectura para todos
-- ---------------------------------------------------------------
GRANT SELECT ON public.equipos  TO anon, authenticated;
GRANT SELECT ON public.partidos TO anon, authenticated;

-- ---------------------------------------------------------------
-- Datos de usuario — solo authenticated
-- RLS restringe a los propios registros de cada usuario
-- ---------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.usuarios               TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.predicciones           TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.predicciones_especiales TO authenticated;

-- ---------------------------------------------------------------
-- Escritura admin en partidos (INSERT/UPDATE resultados)
-- RLS restringe esto a usuarios con es_admin = true
-- ---------------------------------------------------------------
GRANT INSERT, UPDATE ON public.partidos TO authenticated;

-- ---------------------------------------------------------------
-- Secuencias de los SERIAL PK — necesarias para INSERT
-- ---------------------------------------------------------------
GRANT USAGE ON SEQUENCE public.predicciones_id_seq            TO authenticated;
GRANT USAGE ON SEQUENCE public.predicciones_especiales_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.partidos_id_seq                TO authenticated;
GRANT USAGE ON SEQUENCE public.equipos_id_seq                 TO authenticated;
