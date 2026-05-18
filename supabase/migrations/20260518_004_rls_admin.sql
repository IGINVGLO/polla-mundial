-- =============================================================
-- Migración 004 — Políticas RLS para el administrador
-- Polla del Mundial 2026
-- =============================================================
-- El admin necesita leer y actualizar predicciones de TODOS los
-- usuarios para poder calcular puntos al registrar resultados.
-- Sin estas políticas, calcularYActualizarPuntos y
-- calcularPuntosEspeciales fallan silenciosamente (0 filas).
-- =============================================================

-- ---------------------------------------------------------------
-- PREDICCIONES — el admin puede leer y actualizar todas
-- ---------------------------------------------------------------
CREATE POLICY "predicciones_select_admin" ON public.predicciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "predicciones_update_admin" ON public.predicciones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- ---------------------------------------------------------------
-- PREDICCIONES ESPECIALES — el admin puede leer y actualizar todas
-- ---------------------------------------------------------------
CREATE POLICY "especiales_select_admin" ON public.predicciones_especiales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "especiales_update_admin" ON public.predicciones_especiales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND es_admin = true
    )
  );
