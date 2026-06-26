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
| Login / Register | ✅ Completo — recuperación de contraseña agregada; `ResetPassword.jsx` creado |
| Home | ✅ Completo — resumen personal + partidos del día + sección puntuación + tarjetas de navegación clickeables |
| `usePartidos.js` | ✅ Completo |
| `usePredicciones.js` | ✅ Completo (renombrado a `upsertPrediccion`, añadido `error` y `fetchPredicciones`) |
| `useRanking.js` | ✅ Completo (añadido `error`) |
| `TarjetaPartido.jsx` | ✅ Completo — botón "Ver picks de todos" + `ModalPicks.jsx` cuando partido cerrado + badges de estado (sin predecir / guardada / sin predicción) |
| Página Predicciones | ✅ Completo — tabs + filtro grupo + tabla posiciones + tabla mejores terceros con criterios FIFA |
| Página Grupos | ✅ Completo — tabla de posiciones A–L con criterios FIFA (usa `calcularTablaGrupo` del lib) |
| `calcularPosiciones.js` | ✅ Completo — `src/lib/calcularPosiciones.js`; exporta `calcularTablaGrupo` y `calcularMejoresTerceros` |
| Página Ranking | ✅ Completo — tabla + botón compartir WhatsApp |
| Página MiPerfil | ✅ Completo — estadísticas (posición, puntos, exactos, parciales) + predicción especial guardada |
| Supabase: tablas + RLS + trigger | ✅ Completo |
| `.env.local` con credenciales reales | ✅ Completo |
| Predicciones especiales (campeón/goleador) | ✅ Completo — `src/pages/PrediccionesEspeciales.jsx` |
| AdminPanel (registro de resultados) | ✅ Completo — tabs Partidos + Especiales + Invitaciones; asignación de equipos en partidos eliminatorios |
| Función `calcularYActualizarPuntos` | ✅ Completo — `src/lib/adminHelpers.js` |
| Función `calcularPuntosEspeciales` | ✅ Completo — `src/lib/adminHelpers.js` |
| Componente `PartidoAdminRow` | ✅ Completo — `src/components/admin/PartidoAdminRow.jsx` |
| Ruta `/predicciones-especiales` + enlace Navbar | ✅ Completo |
| Ruta `/grupos` + enlace Navbar | ✅ Completo — entre "Mis Picks" y "Especiales" |
| Ruta `/admin` + enlace Navbar (solo admin) | ✅ Completo |
| RLS admin (migración 004) | ✅ Completo |
| `vercel.json` (SPA rewrite) | ✅ Completo |
| Repo en GitHub | ✅ Completo — https://github.com/IGINVGLO/polla-mundial |
| Deploy en Vercel | ✅ Completo — https://polla-mundial-peach.vercel.app |
| Seed datos (equipos + partidos) | ✅ Completo — 48 equipos, 104 partidos en `supabase/migrations/20260518_005_seed_mundial2026.sql` |
| GRANTs de acceso a tablas (migración 006) | ✅ Completo — `supabase/migrations/20260518_006_grants.sql` |
| `BannerAviso.jsx` | ✅ Completo — banner amarillo en Layout (visible hasta 18 jun 2026) |
| `ModalPicks.jsx` | ✅ Completo — modal con tabla de picks de todos por partido |
| `ResetPassword.jsx` + ruta `/reset-password` | ✅ Completo — página pública para actualizar contraseña |
| `Home.jsx` | ✅ Completo — partidos del día primero + resumen personal + tarjetas nav + puntuación |
| `Navbar.jsx` | ✅ Completo — badge verde animado cuando hay partidos hoy |
| `BannerNovedades.jsx` | ✅ Completo — banner azul con novedades v3, se cierra con localStorage |

## Notas Sesión 10

- **`Home.jsx` — sección "Partidos de hoy":** Usa `partidos` y `predicciones` ya cargados (sin fetches adicionales). `predMapFull` es un `Map<partido_id, prediccion>` para lookup O(1); coexiste con `predMapSet` (el `Set` que ya existía para contar pendientes). Los badges de estado siguen la jerarquía: `resultado_registrado === true` → verde con marcador; `fechaHora > ahora` → azul con hora; en caso contrario → naranja "En curso".
- **Hora en formato Colombia:** `format(fechaHora, 'h:mm a', { locale: es })` — igual que en `TarjetaPartido` y `PartidoAdminRow`. El locale `es` puede producir "p. m." con espacio; es comportamiento de date-fns v4, no un bug.
- **Skeleton de "Partidos de hoy":** Muestra 2 filas de placeholder mientras `loadingResumen` sea true. Reutiliza la misma bandera de loading que el resumen personal (misma fuente de datos).
- **`Ranking.jsx` — botón compartir WhatsApp:** Añadido dentro del `<div className="flex items-center gap-2">` de la celda Jugador. Usa `ml-auto` para empujar el botón al extremo derecho del flex container. `idx + 1` calcula la posición sin estado adicional. `window.open` con `_blank` — no requiere librería externa.
- **Deuda pendiente:** Los 5 errores de lint preexistentes de sesión anterior siguen sin tocar (`usePartidos.js`, `usePredicciones.js`, `MiPerfil.jsx`, `adminHelpers.js`, `vite.config.js`). La sección "Partidos de hoy" filtra por `toDateString()` que usa la zona horaria del navegador del usuario (correcto para usuarios en Colombia).
- **Bug corregido: Semifinales no aparecían en `Predicciones.jsx`.** `FASES_ORDEN` y `FASES_LABEL` usaban la clave `'semis'`, pero en Supabase la columna `partidos.fase` guarda el valor exacto `'semifinal'` (ids 189 y 190). Como `fasesPresentes` filtra con `partidos.some((p) => p.fase === f)`, la sección completa se omitía silenciosamente (sin error visible). Corregido a `'semifinal'` en ambas constantes. Si se agregan nuevas fases en el futuro, verificar que la clave en el código coincida carácter por carácter con el valor real en la columna `fase` de Supabase, no solo con el nombre "lógico" de la fase.

## Notas Sesión 11

- **Bug `AdminPanel.jsx` — Semifinales:** El mismo bug de `Predicciones.jsx` existía en `AdminPanel.jsx`: `FASES_ORDEN` tenía `'semis'` y `FASE_LABEL` tenía `semis: 'Semis'`. La tab no aparecía porque `fasesPresentes.filter((f) => partidos.some((p) => p.fase === f))` nunca encontraba coincidencia con el valor real `'semifinal'` de la DB. Corregido a `'semifinal': 'Semifinales'` en ambos objetos.
- **Bug `TarjetaPartido.jsx` — Modal de picks:** El botón "Ver picks de todos 👁" aparecía para todos cuando `cerrado` era `true` (condición compuesta: `predicciones_cerradas || time-based`). Pero la RLS de Supabase solo permite leer picks ajenos cuando `predicciones_cerradas = true` en la DB. Para usuarios no-admin, clickar el botón en un partido cerrado solo por tiempo devolvía datos vacíos o solo el pick propio. El admin sí veía todo (bypass RLS vía migración 004). Fix: el botón ahora solo se renderiza cuando `partido.predicciones_cerradas === true`, alineando la UI con cuando la RLS realmente permite acceso para cualquier usuario.
- **`Predicciones.jsx` — Rediseño con tabs:** `faseActiva` inicia en `null`; `faseReal = faseActiva ?? defaultFase` permite que la detección automática funcione hasta que el usuario seleccione manualmente. `detectarFaseDefault` busca el partido más próximo sin `resultado_registrado`, lo que apunta naturalmente a la fase actualmente relevante. Cambiar de tab resetea `grupoActivo` a `'Todos'` para evitar que el filtro de grupo persista en fases donde no aplica.
- **`Grupos.jsx` — Cálculo de posiciones:** La función `calcularPosiciones` inicializa stats para todos los equipos del grupo (incluso sin resultados) y acumula desde partidos con `resultado_registrado = true`. El filtro de partidos por grupo usa el campo `grupo` de la tabla `partidos` (no inferencia por equipos). La leyenda de clasificación (verde / amarillo) se muestra siempre, independientemente de si hay resultados.
- **`Grupos.jsx` — Equipos del grupo:** La query a `equipos` incluye el campo `grupo TEXT` del esquema, poblado por el seed `20260518_005_seed_mundial2026.sql`. Si hay equipos sin `grupo` asignado, quedan fuera del filtro `e.grupo === grupoActivo` sin generar errores.
- **Deuda pendiente:** Los 5 errores de lint preexistentes siguen sin tocar (`usePartidos.js`, `usePredicciones.js`, `MiPerfil.jsx`, `adminHelpers.js`, `vite.config.js`).

## Notas Sesión 12

- **`src/lib/calcularPosiciones.js` — nuevo módulo central:** Exporta `calcularTablaGrupo(partidos, equipos)` y `calcularMejoresTerceros(partidos, equipos)`. Ambas funciones reciben `partidos` YA filtrados a `resultado_registrado = true` (el filtrado es responsabilidad del llamador). Esto evita que el lib dependa de campos que no siempre están en el SELECT de la query.
- **Criterios FIFA 2026 implementados en `calcularTablaGrupo`:** (1) Puntos H2H, (2) DIF goles H2H, (3) GF H2H, (4) DIF goles general, (5) GF general, (6) Fair play — DEUDA TÉCNICA: requiere columnas `tarjetas_amarillas`/`tarjetas_rojas` en `partidos`; actualmente no existen en el esquema, se omite y cae al siguiente criterio, (7) Ranking FIFA — DEUDA TÉCNICA: sin datos en el esquema actual, se omite y cae a orden alfabético como último desempate.
- **H2H correcto para 3-4 equipos empatados:** `computeH2H` acumula stats de cada equipo contra TODOS los demás empatados (no pairwise). Se agrupa por puntos totales y se aplica `sortTied` dentro de cada grupo, lo que evita la no-transitividad de comparadores H2H pairwise en escenarios circulares (A gana a B, B gana a C, C gana a A).
- **`Predicciones.jsx` — equipos derivados sin fetch adicional:** `equiposDePartidos` se construye con `useMemo` a partir de los partidos de fase=grupos ya cargados por `usePartidos()`. Cada partido con equipos válidos aporta `equipo_local` y `equipo_visitante` al mapa; el campo `grupo` del partido se agrega al objeto equipo. Evita una llamada adicional a `equipos` desde Supabase.
- **`TablaGrupo` en Predicciones.jsx:** Aparece encima de los partidos cuando se selecciona un grupo específico. Los colores (verde/amarillo) solo se aplican cuando `hayResultados = psConResultado.length > 0`; si no hay resultados, la tabla muestra los 4 equipos en 0 sin colores.
- **`MejoresTerceros` en Predicciones.jsx:** Aparece al final de la vista "Todos". Solo incluye grupos con `ps.length > 0` (al menos 1 resultado). Las columnas "Estado" y los badges "Clasifica"/"Eliminado" solo aparecen cuando los 12 grupos tienen resultados (`todos12 = terceros.length === 12`). El coloring rojo (eliminado) requiere exactamente 12 terceros para evitar mostrar "Eliminado" prematuramente.
- **`Grupos.jsx` — migrado al lib:** Eliminada la función local `calcularPosiciones`; ahora usa `calcularTablaGrupo` importada. Añadido `hayResultados = partidosGrupo.length > 0` para aplicar colores solo cuando hay datos.
- **Deuda pendiente:** Fair play y Ranking FIFA omitidos (caen a alfabético). No bloquea la app pero puede dar ordenamiento incorrecto en desempates extremos. Requeriría agregar `tarjetas_amarillas INT DEFAULT 0` y `tarjetas_rojas INT DEFAULT 0` a la tabla `partidos` vía nueva migración.

## Notas Sesión 9

- **Lógica de "partido abierto":** `!partido.predicciones_cerradas && new Date(partido.fecha_hora) > new Date()` — es el inverso exacto del `cerrado` que ya usaba `TarjetaPartido`. Se reutiliza en `Home.jsx` para contar pendientes; no crear una tercera definición si se necesita en otro lado.
- **`TarjetaPartido.jsx` — badges de estado:** Tres estados posibles según `cerrado` y si `prediccion != null`:
  - Abierto sin predicción → borde `border-l-4 border-orange-400` + badge "⚠️ Sin predecir" (`bg-orange-100 text-orange-700`).
  - Abierto con predicción → badge "✓ Predicción guardada" (`bg-green-100 text-green-700`), sin borde especial.
  - Cerrado sin predicción → borde `border-l-4 border-slate-300` + badge "Sin predicción" (`bg-slate-100 text-slate-500`).
  - Cerrado con predicción → sin badge nuevo (ya se muestra el marcador + puntos obtenidos).
  El badge se renderiza como una fila `flex justify-end` al inicio de la tarjeta (no `absolute`) para evitar que se superponga con los nombres largos de equipos en pantallas angostas.
- **`Home.jsx` — resumen personal:** Usa `usePartidos()` + `usePredicciones()` + `useRanking()` sin fetches adicionales. "Predicciones guardadas" muestra `predicciones.length` de `partidos.length` (104, incluye los de eliminatorias con equipos por definir). La posición en el ranking es `ranking.findIndex(r => r.id === user.id) + 1`; si es `0` (usuario no encontrado) se muestra "—". Botón "Ir a predecir →" solo aparece si hay partidos abiertos sin predicción; si no, mensaje "¡Estás al día! ✓".
- **`MiPerfil.jsx` — refactor de estadísticas:** Se eliminó el fetch directo a `ranking` (`.eq('id', user.id).single()`) y el conteo de `predicciones`; ahora la sección de estadísticas (debajo del formulario) usa `useRanking()` para posición, puntos totales, exactos y parciales — mismo patrón que `Home.jsx`. El conteo "predicciones guardadas" ya no se muestra aquí (queda solo en `Home.jsx` para no duplicar el mismo número en dos páginas).
- **Predicción especial en `MiPerfil.jsx` — corrección de join:** La query indicada (`select('campeon_id, goleador_nombre, equipos(nombre)')`) es ambigua porque `predicciones_especiales` tiene **dos** FKs a `equipos` (`campeon_id` y `goleador_equipo_id`) — mismo problema de PostgREST documentado en Sesión 5 para `usePartidos`. Se usó `campeon:campeon_id(nombre)` para desambiguar, y `.maybeSingle()` en vez de `.single()` para no lanzar error cuando el usuario aún no guardó su predicción especial (`especial === null` → "No registrada aún").
- **Deuda pendiente:** Ninguna de las 3 tareas requirió migraciones SQL nuevas ni cambios de RLS. Quedan sin tocar 5 errores de lint preexistentes en `master` (no relacionados con esta sesión): `usePartidos.js`, `usePredicciones.js`, `MiPerfil.jsx` (patrón `setState` síncrono en `useEffect`), `adminHelpers.js` (`goleadorEqId` sin usar) y `vite.config.js` (`__dirname`).

## Notas Sesión 8

- **CIERRE_ESPECIALES extendido:** Cambiado de `2026-06-11T19:00:00Z` a `2026-06-19T05:00:00Z` (18 jun a medianoche hora Colombia UTC-5). Actualizar si vuelve a cambiar tanto en `PrediccionesEspeciales.jsx` como en `BannerAviso.jsx`.
- **BannerAviso.jsx:** Componente en `src/components/ui/` que se autodesactiva cuando `new Date() >= CIERRE`. No necesita props. Se monta en `Layout.jsx` entre `<Navbar />` y `<main>`, fuera del contenedor max-width para que ocupe todo el ancho. Usar clases `bg-yellow-50 border-b border-yellow-300 text-yellow-800`.
- **Recuperación de contraseña:** `Login.jsx` llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo })`. El link del email lleva a `/reset-password` (ruta pública, fuera de `ProtectedRoute`). `ResetPassword.jsx` llama a `supabase.auth.updateUser({ password })` — Supabase maneja el token de sesión automáticamente desde la URL del email. Al éxito navega a `/login` con `state: { resetOk: true }` para mostrar el mensaje de confirmación.
- **ModalPicks.jsx:** El componente recibe `picks` (array o null), `partido`, `userId`, `loading`, `onClose`. La query en `TarjetaPartido.jsx` incluye `usuario_id` en el SELECT para poder resaltar la fila propia. El primer fetch se cachea en estado local (`picks !== null` evita refetch al reabrir). RLS cubre la privacidad: la query solo corre cuando `cerrado === true`.
- **Orden en ModalPicks:** Si `resultado_registrado === true`, ordena por `puntos_obtenidos DESC`. Si no, ordena por `alias ASC`. Esto da sentido al listado en ambos estados del partido.

## Notas Sesión 7

- **Asignación de equipos en partidos eliminatorios:** `PartidoAdminRow` ahora detecta si `equipo_local_id === null || equipo_visitante_id === null` y muestra un formulario alternativo con dos `<select>` y un botón "Asignar equipos". Al guardar hace `UPDATE partidos SET equipo_local_id, equipo_visitante_id WHERE id = ?` y llama `onUpdate` con el objeto actualizado (incluyendo los objetos `equipo_local` y `equipo_visitante` construidos desde el array `equipos`).
- **`equipos` se pasa como prop por la cadena:** `AdminPanel` → `TabPartidos` → `PartidoAdminRow`. `TabPartidos` recibió el prop `equipos` nuevo. `PartidoAdminRow` tiene `equipos = []` con default vacío.
- **El toggle de predicciones cerradas y el formulario de resultado quedan ocultos** mientras el partido no tenga equipos asignados (`equiposNull === true`). Solo se muestran tras asignar.
- **Validación básica de asignación:** muestra error si los dos selects tienen el mismo equipo o si alguno está vacío.

## Notas Sesión 6

- **Home.jsx** — Agregada sección "🏆 ¿Cómo se puntúa?" debajo de las tarjetas de bienvenida. Usa datos declarativos (`PUNTUACION` array) para facilitar cambios futuros. Badges de color diferenciados por tipo de acierto.
- **AdminPanel tab Invitaciones** — Muestra el link de registro con botón copiar (feedback 2s) y botón WhatsApp. Lista todos los usuarios con alias, nombre, fecha de registro y badge admin. Contador `X / 40 participantes`.
- **Política RLS requerida para lista de usuarios:** `usuarios_select_admin` permite al admin leer todos los registros de `public.usuarios`. Sin ella, la query devuelve solo el propio perfil. Ejecutar en Supabase antes de usar la tab Invitaciones:
  ```sql
  CREATE POLICY "usuarios_select_admin" ON public.usuarios
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.usuarios u2 WHERE u2.id = auth.uid() AND u2.es_admin = true));
  ```
- **Tab Invitaciones no depende del loading principal** — Hace su propio fetch al montarse, independiente del `Promise.all` de partidos/equipos. Así no bloquea ni enlentece las otras tabs.
- **Tarjetas de Home no navegaban:** Las tres tarjetas (Mis predicciones, Ranking, Especiales) eran `div` sin enlace. Convertidas a `<Link>` de React Router con `hover:shadow-md`.

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
- **Cierre de especiales hardcodeado:** `CIERRE_ESPECIALES = new Date('2026-06-19T05:00:00Z')` (medianoche del 18 jun hora Colombia, actualizado en sesión 8). Si cambia de fecha, actualizar la constante en `PrediccionesEspeciales.jsx` **y** en `BannerAviso.jsx`.
- **`vercel.json` creado:** El rewrite `"/(.*)" → "/index.html"` es necesario para que React Router v7 funcione en Vercel sin errores 404 al refrescar o navegar directamente a una ruta.
- **Migración 004 ejecutada:** Políticas admin activas en Supabase. El flujo de cálculo de puntos está operativo.

## Notas Sesión 13

- **`Home.jsx` — nuevo orden de secciones:** Partidos de hoy → Resumen personal (TarjetaEstadistica + botón) → Tarjetas de navegación (Mis picks / Ranking / Especiales) → ¿Cómo se puntúa? El saludo (h1 + p) sigue en primer lugar siempre. Solo se reordenaron bloques JSX; sin cambios de lógica ni de datos.
- **`Navbar.jsx` — badge verde en "Inicio":** Se importa `usePartidos()` directamente en el Navbar. `hayPartidosHoy` usa `toDateString()` de la fecha local del navegador (igual que `Home.jsx` y `TarjetaPartido.jsx` — zona horaria del usuario). El badge es un `<span>` con `w-2 h-2 rounded-full bg-green-500 animate-pulse` posicionado inline como superíndice con `items-start gap-0.5`. **Posible doble-fetch:** `usePartidos()` ya está montado en `Home.jsx`, `Predicciones.jsx` y otras páginas que usan el mismo hook. Si el hook no cachea entre instancias (actualmente no lo hace — cada instancia hace su propio fetch), el Navbar genera un fetch adicional en cada página. Es aceptable para ~40 usuarios pero se puede optimizar con Zustand o Context si aparece latencia notable.
- **`BannerNovedades.jsx`:** Estado inicial derivado de `localStorage` en el inicializador del `useState` (lazy init) — no produce re-render al montar. Key `polla_novedades_v3_visto`; incrementar a `_v4_`, `_v5_`... para forzar que vuelva a aparecer en futuras sesiones. Montado en `Layout.jsx` entre `<BannerAviso />` y `<main>`, fuera del contenedor max-width para ocupar todo el ancho, igual que `BannerAviso`.
- **Deuda pendiente:** Posible doble-fetch de `usePartidos` en Navbar (ver punto anterior). Los 5 errores de lint preexistentes siguen sin tocar.

## Notas Sesión 2

- **Bug crítico corregido en RLS:** La política original `predicciones_select_own` (solo ver las propias) rompía la vista `ranking` porque PostgreSQL aplica RLS a las tablas subyacentes de la vista. La política correcta permite leer predicciones propias siempre y las ajenas solo cuando el partido está cerrado (`predicciones_cerradas = true`). Esto evita spoilers de picks ajenos antes del partido.
- **Register.jsx actualizado:** El flujo anterior tenía una condición de carrera — el trigger `on_auth_user_created` insertaba en `public.usuarios` y Register.jsx también lo hacía manualmente, causando error de clave duplicada. Solución: pasar `alias` y `nombre_completo` en `options.data` del `signUp` para que el trigger los lea desde `raw_user_meta_data`, y eliminar el INSERT manual.
- **TarjetaPartido es componente propio:** La lógica de estado del formulario (inputs locales, feedback, guardando) vive en `TarjetaPartido.jsx`, no en la página. Esto evita N re-renders en la página cuando el usuario escribe en un campo.
- **Deuda técnica:** La vista `ranking` usa `SECURITY INVOKER` (default en PostgreSQL). Si en el futuro se agregan restricciones de RLS más finas en `predicciones`, revisar que la vista siga computando correctamente para todos los usuarios.
