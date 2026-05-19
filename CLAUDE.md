# Polla del Mundial 2026 — Guía para Claude

App de predicciones del Mundial 2026 para ~40 personas. Los usuarios predicen resultados de partidos y compiten en un ranking de puntos.

## Stack (versiones reales instaladas)

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite | React 19.2, Vite 8 |
| Estilos | Tailwind CSS | v3.4 |
| Backend / BD | Supabase | @supabase/supabase-js 2.x |
| Auth | Supabase Auth | incluido en SDK |
| Estado global | Zustand | v5 |
| Routing | React Router | v7 |
| Fechas | date-fns | v4 |
| Hosting | Vercel | — |

> El spec original pedía React 18 / RR v6 / Zustand v4 / date-fns v3, pero npm instaló las versiones actuales. No degradar.

## Comandos

```bash
npm run dev       # servidor local en http://localhost:5173
npm run build     # build de producción (verificar antes de cada PR)
npm run preview   # previsualizar el build
npm run lint      # ESLint
```

## Variables de entorno

Archivo: `.env.local` (ignorado en git por `*.local`)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Nunca hardcodear estas claves. El `supabaseClient.js` lanza error si faltan.

## Migraciones SQL

Los archivos SQL están en `supabase/migrations/` y deben ejecutarse **en orden** en el SQL Editor de Supabase:

| Archivo | Contenido |
|---|---|
| `20260518_001_schema_inicial.sql` | Tablas (usuarios, equipos, partidos, predicciones, predicciones_especiales) + vista ranking |
| `20260518_002_rls.sql` | RLS + políticas de acceso por tabla |
| `20260518_003_trigger.sql` | Trigger `on_auth_user_created` para crear perfil automáticamente al registrarse |
| `20260518_004_rls_admin.sql` | Políticas RLS admin para leer/actualizar predicciones ajenas |
| `20260518_005_seed_mundial2026.sql` | Seed: 48 equipos + 104 partidos |
| `20260518_006_grants.sql` | GRANTs de acceso a tablas para roles `anon` y `authenticated` |

## Estructura de carpetas

```
src/
├── App.jsx                     # Árbol de rutas completo
├── main.jsx                    # Entry point
├── index.css                   # Tailwind + clases utilitarias globales
├── assets/                     # Imágenes, íconos estáticos
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx  # Redirige a /login si no hay sesión
│   ├── layout/
│   │   ├── Layout.jsx          # Wrapper con Navbar + <Outlet />
│   │   └── Navbar.jsx          # Barra de navegación responsive
│   ├── ui/                     # Botones, inputs, cards reutilizables (vacío aún)
│   ├── partidos/               # TarjetaPartido, ListaPartidos (pendiente)
│   ├── predicciones/           # FormPrediccion, ResumenPrediccion (pendiente)
│   ├── ranking/                # TablaRanking, FilaRanking (pendiente)
│   └── admin/                  # PanelAdmin, FormResultado (pendiente)
├── hooks/
│   ├── useAuth.js              # Re-exporta useAuthStore
│   ├── usePartidos.js          # Fetch partidos con join a equipos
│   ├── usePredicciones.js      # CRUD predicciones del usuario actual
│   └── useRanking.js           # Fetch vista ranking
├── lib/
│   ├── supabaseClient.js       # Instancia única del cliente Supabase
│   └── puntuacion.js           # calcularPuntos(), PUNTOS_CAMPEON, PUNTOS_GOLEADOR
├── pages/
│   ├── Login.jsx               # ✅ Funcional
│   ├── Register.jsx            # ✅ Funcional (crea auth.user + public.usuarios)
│   ├── Home.jsx                # ✅ Placeholder con tarjetas de bienvenida
│   ├── Predicciones.jsx        # ⏳ Pendiente
│   ├── Ranking.jsx             # ⏳ Pendiente
│   ├── MiPerfil.jsx            # ⏳ Pendiente
│   └── admin/
│       └── AdminPanel.jsx      # ⏳ Pendiente
└── store/
    └── authStore.js            # Zustand: user, perfil, isAdmin(), inicializar()
```

## Alias de importación

`@/` apunta a `src/`. Usar siempre en lugar de rutas relativas profundas.

```js
// ✅ Correcto
import { supabase } from '@/lib/supabaseClient'
// ❌ Evitar
import { supabase } from '../../../lib/supabaseClient'
```

## Esquema de base de datos (Supabase)

### Tablas

```sql
-- Extiende auth.users de Supabase
public.usuarios (id UUID PK, alias TEXT UNIQUE, nombre_completo TEXT,
                 avatar_url TEXT, es_admin BOOLEAN, creado_en TIMESTAMPTZ)

public.equipos  (id SERIAL PK, nombre TEXT, codigo TEXT UNIQUE,
                 grupo TEXT, bandera_url TEXT)

public.partidos (id SERIAL PK, fase TEXT, grupo TEXT,
                 equipo_local_id → equipos, equipo_visitante_id → equipos,
                 fecha_hora TIMESTAMPTZ, estadio TEXT, ciudad TEXT,
                 goles_local INT, goles_visitante INT,
                 resultado_registrado BOOL, predicciones_cerradas BOOL)

public.predicciones (id SERIAL PK, usuario_id → usuarios, partido_id → partidos,
                     goles_local INT, goles_visitante INT, puntos_obtenidos INT,
                     creado_en TIMESTAMPTZ, actualizado_en TIMESTAMPTZ,
                     UNIQUE(usuario_id, partido_id))

public.predicciones_especiales (id SERIAL PK, usuario_id → usuarios UNIQUE,
                                 campeon_id → equipos, goleador_nombre TEXT,
                                 goleador_equipo_id → equipos,
                                 puntos_campeon INT, puntos_goleador INT)
```

### Vista ranking

```sql
CREATE VIEW public.ranking AS
SELECT u.id, u.alias, u.avatar_url,
  COALESCE(SUM(p.puntos_obtenidos), 0)
    + COALESCE(pe.puntos_campeon, 0)
    + COALESCE(pe.puntos_goleador, 0) AS puntos_totales,
  COUNT(CASE WHEN p.puntos_obtenidos >= 3 THEN 1 END) AS resultados_exactos,
  COUNT(CASE WHEN p.puntos_obtenidos = 1 THEN 1 END) AS resultados_parciales
FROM public.usuarios u
LEFT JOIN public.predicciones p ON p.usuario_id = u.id
LEFT JOIN public.predicciones_especiales pe ON pe.usuario_id = u.id
GROUP BY u.id, u.alias, u.avatar_url, pe.puntos_campeon, pe.puntos_goleador
ORDER BY puntos_totales DESC;
```

## Sistema de puntuación

```js
// src/lib/puntuacion.js
calcularPuntos(prediccion, resultado) // → 3 | 1 | 0
PUNTOS_CAMPEON  = 10
PUNTOS_GOLEADOR = 5
```

- **3 pts** — resultado exacto (marcador exacto)
- **1 pt** — solo ganador/empate correcto
- **10 pts** — campeón acertado (predicción especial)
- **5 pts** — goleador acertado (predicción especial)

## Reglas de negocio

1. **Cierre de predicciones:** bloquear si `new Date() >= new Date(partido.fecha_hora)` o si `partido.predicciones_cerradas === true`. Verificar siempre en el frontend antes de mostrar el formulario.
2. **Predicciones especiales:** solo disponibles hasta el inicio del primer partido del torneo.
3. **Un admin único:** `perfil.es_admin === true` en `public.usuarios`. El `authStore` expone `isAdmin()` para verificarlo.
4. **Registro abierto:** cualquiera puede crear cuenta con email + contraseña.
5. **RLS en Supabase:** cada usuario solo lee/escribe sus propias predicciones; el ranking es público; solo admin escribe en `partidos`.

## Patrones de código establecidos

### Autenticación (authStore)
```js
const { user, perfil, loading, isAdmin, logout } = useAuthStore()
// inicializar() se llama en App.jsx al montar — no llamar de nuevo
```

### Rutas protegidas
```jsx
// Ruta normal protegida → envuelta en el Layout padre en App.jsx
// Ruta solo admin:
<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
```

### Clases Tailwind globales (index.css)
```
.btn-primary   → botón azul principal
.btn-secondary → botón gris secundario
.card          → contenedor blanco con borde y sombra
.input         → campo de texto estándar
```

### Hooks de datos
Los hooks (`usePartidos`, `usePredicciones`, `useRanking`) devuelven siempre `{ data, loading, error }` o variante similar. No duplicar lógica de fetch en páginas.

## Estado de implementación

| Área | Estado |
|---|---|
| Inicialización del proyecto | ✅ Completo |
| Configuración Tailwind + alias | ✅ Completo |
| `supabaseClient.js` | ✅ Completo |
| `puntuacion.js` | ✅ Completo |
| `authStore.js` (Zustand) | ✅ Completo |
| Layout + Navbar | ✅ Completo |
| `ProtectedRoute` | ✅ Completo |
| Rutas (`App.jsx`) | ✅ Completo |
| Login / Register | ✅ Funcionales |
| Home | ✅ Placeholder |
| `usePartidos.js` | ✅ Completo |
| `usePredicciones.js` | ✅ Completo (renombrado a `upsertPrediccion`, añadido `error` y `fetchPredicciones`) |
| `useRanking.js` | ✅ Completo (añadido `error`) |
| `TarjetaPartido.jsx` | ✅ Completo |
| Página Predicciones | ✅ Completo |
| Página Ranking | ✅ Completo |
| Página MiPerfil | ✅ Completo |
| Supabase: tablas + RLS + trigger | ✅ Completo |
| `.env.local` con credenciales reales | ✅ Completo |
| Predicciones especiales (campeón/goleador) | ✅ Completo — `src/pages/PrediccionesEspeciales.jsx` |
| AdminPanel (registro de resultados) | ✅ Completo — tabs Partidos + Especiales |
| Función `calcularYActualizarPuntos` | ✅ Completo — `src/lib/adminHelpers.js` |
| Función `calcularPuntosEspeciales` | ✅ Completo — `src/lib/adminHelpers.js` |
| Componente `PartidoAdminRow` | ✅ Completo — `src/components/admin/PartidoAdminRow.jsx` |
| Ruta `/predicciones-especiales` + enlace Navbar | ✅ Completo |
| Ruta `/admin` + enlace Navbar (solo admin) | ✅ Completo |
| RLS admin (migración 004) | ✅ Completo |
| `vercel.json` (SPA rewrite) | ✅ Completo |
| Repo en GitHub | ✅ Completo — https://github.com/IGINVGLO/polla-mundial |
| Deploy en Vercel | ✅ Completo — https://polla-mundial-peach.vercel.app |
| Seed datos (equipos + partidos) | ✅ Completo — 48 equipos, 104 partidos en `supabase/migrations/20260518_005_seed_mundial2026.sql` |
| GRANTs de acceso a tablas (migración 006) | ✅ Completo — `supabase/migrations/20260518_006_grants.sql` |

## Notas Sesión 5

- **Causa raíz del 403/401 en todas las tablas: GRANTs faltantes.** En PostgreSQL, RLS y GRANTs son capas independientes. Sin `GRANT SELECT ON tabla TO anon, authenticated`, el rol ni puede intentar leer la tabla — RLS nunca llega a evaluarse. El SQL Editor funciona porque corre como `postgres` (superuser). La app corre como `anon`/`authenticated` y necesita GRANTs explícitos. Solucionado con `20260518_006_grants.sql`.
- **Clave correcta para Supabase REST API:** Usar la clave JWT (`eyJ...`) desde Project Settings → Data API → `anon public`. La clave nueva en formato `sb_publishable_` es para auth pero el REST API (PostgREST) requiere el JWT. Ambas funcionan una vez aplicados los GRANTs.
- **Migración 006 obligatoria en proyectos nuevos:** Sin ella, todas las queries desde el cliente dan 403/401. La migración 002 solo creó políticas RLS; los GRANTs de tabla-nivel estaban ausentes.
- **`usePartidos.js` y `AdminPanel.jsx`:** La sintaxis de join `equipo_local:equipo_local_id(...)` (sin `!`) es compatible con o sin FK constraints registradas en pg_constraint. No revertir a `equipos!equipo_local_id`.

## Notas Sesión 4

- **Seed definitivo ejecutado:** `20260518_005_seed_mundial2026.sql` contiene 48 equipos distribuidos en 12 grupos (A–L), 72 partidos de fase de grupos y 32 de eliminatorias (16 dieciseisavos + 8 octavos + 4 cuartos + 2 semis + 1 tercero + 1 final). Total: 104 partidos.
- **Colombia en Grupo K:** junto a Portugal, Uzbekistán y Congo. Primer partido Colombia vs Uzbekistán el 14 jun 2026.
- **Partidos eliminatorios con equipos NULL:** Los 32 partidos de dieciseisavos en adelante tienen `equipo_local_id = NULL` y `equipo_visitante_id = NULL`. Se actualizan desde AdminPanel cuando se conozcan los clasificados.
- **Para ser admin:** Ejecutar en Supabase SQL Editor: `UPDATE public.usuarios SET es_admin = true WHERE alias = 'tu-alias';`
- **Seed corregible sin borrar:** El seed usa `ON CONFLICT DO NOTHING` en equipos e `INSERT ... WHERE NOT EXISTS` implícito vía ids fijos, por lo que se puede volver a ejecutar sin duplicar datos.

## Notas Sesión 3

- **Migración 004 obligatoria antes de usar AdminPanel:** Sin `20260518_004_rls_admin.sql`, el admin no puede leer predicciones ajenas ni actualizarlas. `calcularYActualizarPuntos` devolvería 0 filas silenciosamente. Ejecutar en Supabase SQL Editor antes de registrar resultados.
- **`calcularPuntosEspeciales` normaliza tildes:** Usa `normalize('NFD')` + `replace(/[̀-ͯ]/g, '')` para comparar goleador_nombre de forma case-insensitive e ignorando tildes (ej: "Álvarez" === "Alvarez").
- **`PartidoAdminRow` gestiona su propio estado:** Cada fila admin mantiene su estado de edición, loading y feedback internamente. El padre solo recibe `onUpdate(partido)` cuando hay un cambio confirmado en BD.
- **Cierre de especiales hardcodeado:** `CIERRE_ESPECIALES = new Date('2026-06-11T19:00:00Z')` (14:00 hora Colombia). Si el torneo cambia de fecha, actualizar esta constante en `PrediccionesEspeciales.jsx`.
- **`vercel.json` creado:** El rewrite `"/(.*)" → "/index.html"` es necesario para que React Router v7 funcione en Vercel sin errores 404 al refrescar o navegar directamente a una ruta.
- **Migración 004 ejecutada:** Políticas admin activas en Supabase. El flujo de cálculo de puntos está operativo.

## Notas Sesión 2

- **Bug crítico corregido en RLS:** La política original `predicciones_select_own` (solo ver las propias) rompía la vista `ranking` porque PostgreSQL aplica RLS a las tablas subyacentes de la vista. La política correcta permite leer predicciones propias siempre y las ajenas solo cuando el partido está cerrado (`predicciones_cerradas = true`). Esto evita spoilers de picks ajenos antes del partido.
- **Register.jsx actualizado:** El flujo anterior tenía una condición de carrera — el trigger `on_auth_user_created` insertaba en `public.usuarios` y Register.jsx también lo hacía manualmente, causando error de clave duplicada. Solución: pasar `alias` y `nombre_completo` en `options.data` del `signUp` para que el trigger los lea desde `raw_user_meta_data`, y eliminar el INSERT manual.
- **TarjetaPartido es componente propio:** La lógica de estado del formulario (inputs locales, feedback, guardando) vive en `TarjetaPartido.jsx`, no en la página. Esto evita N re-renders en la página cuando el usuario escribe en un campo.
- **Deuda técnica:** La vista `ranking` usa `SECURITY INVOKER` (default en PostgreSQL). Si en el futuro se agregan restricciones de RLS más finas en `predicciones`, revisar que la vista siga computando correctamente para todos los usuarios.
