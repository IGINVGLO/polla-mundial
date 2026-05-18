-- =============================================================
-- Migración 003 — Trigger de registro automático
-- Polla del Mundial 2026
-- =============================================================
--
-- Al crear un usuario en auth.users, inserta automáticamente
-- su fila en public.usuarios.
-- Lee alias y nombre_completo desde raw_user_meta_data,
-- que se pasa en options.data al llamar a supabase.auth.signUp().
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, alias, nombre_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'alias', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
