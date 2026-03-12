# Arquitectura – Dashboard de Pilotos IA Agéntica

## 1. Visión técnica

Aplicación web interna tipo dashboard B2B para el seguimiento de pilotos de IA agéntica. Stack moderno con renderizado en servidor, base de datos gestionada y despliegue serverless.

**Stack principal:** Next.js 14+ (App Router) · Supabase (Postgres + Auth + RLS) · Vercel

---

## 2. Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js (App Router)                  │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │   Pages /    │  │  Server    │  │  Route    │  │  │
│  │  │  Layouts     │  │  Components│  │  Handlers │  │  │
│  │  │  (RSC)       │  │  (RSC)     │  │  (API)    │  │  │
│  │  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘  │  │
│  │         │                │               │        │  │
│  │  ┌──────┴────────────────┴───────────────┴─────┐  │  │
│  │  │         Supabase Client (SSR + Browser)      │  │  │
│  │  └──────────────────────┬───────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────┘  │
└─────────────────────────────┼───────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase (cloud)                      │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth     │  │  PostgreSQL  │  │  Storage (futuro) │  │
│  │  (JWT)    │  │  + RLS       │  │                   │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Stack tecnológico detallado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Framework** | Next.js 14+ (App Router) | RSC, layouts anidados, streaming, Server Actions |
| **Lenguaje** | TypeScript | Tipado estricto en todo el stack |
| **Estilos** | Tailwind CSS + shadcn/ui | Diseño minimalista B2B, componentes accesibles |
| **Base de datos** | Supabase (PostgreSQL 15) | RLS nativo, Auth integrado, API auto-generada |
| **Autenticación** | Supabase Auth | Email/password, sesiones JWT, middleware SSR |
| **ORM / Queries** | Supabase JS Client v2 | Tipado generado desde DB, funciona en server y client |
| **Estado cliente** | React state + `nuqs` (URL state) | Filtros persistidos en URL, sin store global pesado |
| **Gantt ligero** | Componente custom con CSS Grid | Evitar dependencia pesada para timeline simple |
| **Hosting** | Vercel | Edge functions, preview deploys, integración Git |
| **CI/CD** | Vercel + GitHub | Deploy automático por push a main/preview en PRs |

---

## 4. Estructura del proyecto

```
src/
├── app/                          # App Router (Next.js)
│   ├── (auth)/                   # Grupo de rutas públicas (login)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupo de rutas protegidas
│   │   ├── layout.tsx            # Shell: sidebar + topbar
│   │   ├── page.tsx              # Home / Pilotos (CU-01)
│   │   ├── pilots/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Detalle piloto (CU-02/03)
│   │   └── admin/
│   │       └── page.tsx          # Gestión usuarios (CU-05)
│   ├── api/                      # Route Handlers (si se necesitan)
│   ├── layout.tsx                # Root layout (providers, fonts)
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui primitivos (button, badge, input, etc.)
│   ├── kpi-card.tsx
│   ├── pilots-table.tsx
│   ├── pilots-timeline.tsx       # Gantt ligero
│   ├── pilot-header.tsx
│   ├── impact-event-card.tsx
│   ├── impact-event-modal.tsx
│   ├── view-toggle.tsx
│   ├── sidebar.tsx
│   └── topbar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   ├── server.ts             # createServerClient (cookies)
│   │   ├── middleware.ts         # Refresh de sesión
│   │   └── admin.ts             # Service role (solo server, admin ops)
│   ├── types/
│   │   └── database.ts           # Tipos generados con supabase gen types
│   ├── queries/
│   │   ├── pilots.ts             # Funciones de datos: listPilots, getPilot, etc.
│   │   ├── impact-events.ts
│   │   ├── kpis.ts               # getGlobalKPIs, getPilotKPIs
│   │   └── users.ts
│   ├── actions/
│   │   ├── pilot-actions.ts      # Server Actions: crear, editar piloto
│   │   ├── event-actions.ts      # Server Actions: crear, editar, borrar evento
│   │   └── user-actions.ts       # Server Actions: cambiar rol
│   └── utils.ts                  # Helpers: formatDate, cn(), etc.
│
├── hooks/
│   └── use-role.ts               # Hook para obtener el rol del usuario actual
│
├── middleware.ts                  # Protección de rutas + refresh sesión
│
└── .env.local                    # Variables de entorno (no en repo)
```

---

## 5. Modelo de datos

Basado en el esquema ya definido en `migration.sql`.

### Diagrama entidad-relación

```
auth.users
    │
    ├── 1:1 ── profiles (id → auth.users.id)
    │             • email
    │             • full_name
    │
    ├── 1:1 ── user_roles (user_id → auth.users.id)
    │             • role: lector | editor | admin
    │             • assigned_by
    │
    └── audit ── pilots.created_by / updated_by
                 impact_events.created_by / updated_by

pilots
    │ id (uuid, PK)
    │ name (text, NOT NULL)
    │ objective (text)
    │ status: planificado | en_marcha | finalizado | cancelado
    │ start_date, end_date
    │ trained_people_count (integer, manual)
    │
    └── 1:N ── impact_events (pilot_id → pilots.id, CASCADE)
                 │ event_type: formacion | productividad | otro
                 │ event_date
                 │ description
                 │ trained_people_event (si formacion)
                 │ productivity_improvement_pct (si productividad)

pilot_current_productivity (VIEW)
    → Último % productividad por piloto
```

### Enums PostgreSQL

| Enum | Valores |
|------|---------|
| `app_role` | `lector`, `editor`, `admin` |
| `pilot_status` | `planificado`, `en_marcha`, `finalizado`, `cancelado` |
| `impact_event_type` | `formacion`, `productividad`, `otro` |

### Índices clave

| Índice | Columna(s) | Uso |
|--------|-----------|-----|
| `idx_pilots_status` | `pilots.status` | Filtro por estado en Home |
| `idx_pilots_start_date` | `pilots.start_date` | Filtro/orden por fecha |
| `idx_pilots_end_date` | `pilots.end_date` | Filtro por rango de fechas |
| `idx_impact_events_pilot_date` | `(pilot_id, event_date DESC)` | Timeline de eventos ordenado |
| `idx_impact_events_type` | `event_type` | Consulta de productividad |

---

## 6. Autenticación y autorización

### 6.1 Flujo de autenticación

```
Browser                    Next.js (Vercel)              Supabase Auth
  │                            │                              │
  │  POST /login               │                              │
  │  (email + password)        │                              │
  │ ──────────────────────────►│                              │
  │                            │  signInWithPassword()        │
  │                            │ ────────────────────────────►│
  │                            │           JWT + refresh      │
  │                            │ ◄────────────────────────────│
  │   Set-Cookie (httpOnly)    │                              │
  │ ◄──────────────────────────│                              │
  │                            │                              │
  │  GET /dashboard            │                              │
  │  Cookie: sb-access-token   │                              │
  │ ──────────────────────────►│                              │
  │                            │  middleware: refresh si       │
  │                            │  expirado, redirect si no    │
  │                            │  autenticado                 │
  │   HTML (RSC)               │                              │
  │ ◄──────────────────────────│                              │
```

- **Middleware** (`middleware.ts`): intercepta todas las rutas bajo `/(dashboard)`, refresca el token JWT si está próximo a expirar, redirige a `/login` si no hay sesión válida.
- **Cookies httpOnly**: las sesiones se gestionan con `@supabase/ssr` usando cookies, nunca localStorage.

### 6.2 Autorización por roles

La autorización se aplica en **dos capas**:

#### Capa 1 – UI (Next.js)

| Componente | Lector | Editor | Admin |
|-----------|--------|--------|-------|
| Ver pilotos y KPIs | ✅ | ✅ | ✅ |
| Botón "Añadir piloto" | ❌ | ✅ | ✅ |
| Editar campos piloto | ❌ | ✅ | ✅ |
| Añadir/editar/borrar eventos | ❌ | ✅ | ✅ |
| Menú "Administración" | ❌ | ❌ | ✅ |
| Cambiar rol de usuario | ❌ | ❌ | ✅ |

#### Capa 2 – Base de datos (RLS)

Cada tabla tiene políticas RLS que refuerzan los mismos permisos, usando la función `get_my_role()`:

- **SELECT** en `pilots` y `impact_events`: cualquier usuario autenticado.
- **INSERT/UPDATE/DELETE** en `pilots` y `impact_events`: solo `editor` o `admin`.
- **SELECT** en `user_roles`: solo el propio usuario o `admin`.
- **UPDATE** en `user_roles`: solo `admin`.

Esto garantiza que incluso si se manipula el frontend, la base de datos rechaza operaciones no autorizadas.

---

## 7. Capa de datos y Server Actions

### 7.1 Lectura de datos (Server Components)

Las páginas usan React Server Components para obtener datos directamente en el servidor, sin API intermedia:

```
page.tsx (RSC)
  └── lib/queries/pilots.ts
        └── supabase.from('pilots').select(...)  ← ejecuta en server, con JWT del usuario
```

Las funciones de query (`lib/queries/`) usan el cliente de Supabase creado con las cookies de la request, heredando automáticamente el contexto de autenticación y las políticas RLS.

### 7.2 Escritura de datos (Server Actions)

Las mutaciones se implementan como **Server Actions** de Next.js:

```typescript
// lib/actions/pilot-actions.ts
'use server'

export async function createPilot(formData: FormData) {
  // 1. Crear cliente Supabase con cookies
  // 2. Validar datos (zod)
  // 3. INSERT en pilots (RLS verifica el rol)
  // 4. revalidatePath('/') para refrescar la vista
}
```

Ventajas:
- No se exponen endpoints REST manuales.
- Validación con Zod en servidor antes de llegar a la DB.
- `revalidatePath` / `revalidateTag` para invalidar caché tras mutación.

### 7.3 Cálculo de KPIs

| KPI | Lógica |
|-----|--------|
| Pilotos activos | `COUNT(*) WHERE status = 'en_marcha'` |
| Total personas formadas | `SUM(trained_people_count)` sobre todos los pilotos |
| Media % productividad | `AVG(productivity_improvement_pct)` desde la vista `pilot_current_productivity` |
| % productividad de un piloto | Último evento de tipo `productividad` (por `event_date DESC, created_at DESC`) |

---

## 8. Estrategia de renderizado

| Ruta | Estrategia | Razón |
|------|-----------|-------|
| `/login` | Static + Client | Formulario interactivo, sin datos dinámicos |
| `/` (Home) | Dynamic (SSR) | Datos personalizados por usuario, KPIs en tiempo real |
| `/pilots/[id]` | Dynamic (SSR) | Detalle con datos actualizados |
| `/admin` | Dynamic (SSR) | Lista de usuarios, solo admin |

Todas las rutas dinámicas usan **streaming** con `<Suspense>` para mostrar el shell (sidebar, topbar) inmediatamente mientras los datos se cargan.

```tsx
// app/(dashboard)/page.tsx
export default async function HomePage() {
  return (
    <>
      <Suspense fallback={<KPISkeletons />}>
        <GlobalKPIs />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <PilotsView />
      </Suspense>
    </>
  );
}
```

---

## 9. Gestión del estado en cliente

| Necesidad | Solución |
|-----------|----------|
| Filtros (estado, rango fechas) | URL search params con `nuqs` |
| Toggle lista/cronológica | URL search param (`?view=list\|timeline`) |
| Rol del usuario | Context provider cargado en layout |
| Formulario de evento | Estado local del modal (`useState`) |
| Optimistic updates | `useOptimistic` de React para feedback inmediato |

Principio: **mínimo estado en cliente**. Los datos viven en el servidor; el cliente solo gestiona interacción inmediata.

---

## 10. Seguridad

### Variables de entorno

| Variable | Dónde se usa | Exposición |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Pública (prefijo `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Pública (segura gracias a RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Server Actions admin | Privada (nunca en cliente) |

### Medidas de seguridad

- **RLS activo** en todas las tablas: la DB es la última línea de defensa.
- **Cookies httpOnly** para tokens: no accesibles desde JavaScript del navegador.
- **Validación server-side** con Zod en toda Server Action antes de escribir en DB.
- **HTTPS** forzado en Vercel y Supabase.
- **Service role key** usada exclusivamente en operaciones admin del servidor (cambio de roles).
- **CSRF**: protección implícita por Server Actions (misma origin).

---

## 11. Despliegue y entornos

### Entornos

| Entorno | Branch | URL | Supabase |
|---------|--------|-----|----------|
| **Producción** | `main` | `pilotosai.vercel.app` | Proyecto principal |
| **Preview** | PRs / ramas | `*.vercel.app` (auto) | Mismo proyecto (o linked project para aislamiento) |
| **Local** | — | `localhost:3000` | Supabase local (`supabase start`) |

### Pipeline de despliegue

```
git push → Vercel Build → next build → Deploy Edge
                │
                ├── Preview deploy (PRs)
                └── Production deploy (merge a main)
```

### Desarrollo local

```bash
# 1. Levantar Supabase local
npx supabase start

# 2. Aplicar migraciones
npx supabase db push

# 3. Generar tipos TypeScript
npx supabase gen types typescript --local > src/lib/types/database.ts

# 4. Levantar Next.js
npm run dev
```

---

## 12. Dependencias principales

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.5.x",
    "tailwindcss": "^3.x",
    "zod": "^3.x",
    "nuqs": "^2.x",
    "date-fns": "^3.x",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "supabase": "^1.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x"
  }
}
```

---

## 13. Decisiones de arquitectura (ADRs resumidos)

### ADR-01: App Router sobre Pages Router
- **Decisión:** Usar App Router de Next.js.
- **Razón:** Server Components reducen JS enviado al cliente, Server Actions simplifican mutaciones, layouts anidados permiten shell persistente.

### ADR-02: Supabase Client directo (sin ORM adicional)
- **Decisión:** Usar `@supabase/supabase-js` directamente, sin Prisma ni Drizzle.
- **Razón:** Para un MVP con pocas tablas, el cliente tipado de Supabase (con tipos generados) es suficiente. Menos capas de abstracción = menos complejidad.

### ADR-03: Server Actions en lugar de Route Handlers
- **Decisión:** Usar Server Actions para todas las mutaciones.
- **Razón:** Menos boilerplate que route handlers, validación integrada, `revalidatePath` nativo, progressive enhancement (funciona sin JS).

### ADR-04: Gantt custom en lugar de librería externa
- **Decisión:** Componente timeline propio con CSS Grid/Flexbox.
- **Razón:** El Gantt del MVP es ligero (barras horizontales, tooltip, colores por estado). Una librería como `dhtmlx-gantt` añadiría peso y complejidad innecesarios.

### ADR-05: URL state para filtros
- **Decisión:** Persistir filtros y vista activa en query params (`?status=en_marcha&view=timeline`).
- **Razón:** Permite compartir enlaces con filtros aplicados, funciona con back/forward del navegador, compatible con SSR.

### ADR-06: shadcn/ui como sistema de componentes
- **Decisión:** Usar shadcn/ui (componentes copiados al proyecto, no dependencia externa).
- **Razón:** Componentes accesibles (Radix primitives), completamente personalizables con Tailwind, sin lock-in de versiones, alineado con el design system minimalista definido.

---

## 14. Escalabilidad y rendimiento

### MVP (10-20 pilotos)

- Las queries son directas sin paginación.
- La vista Gantt renderiza todas las barras.
- KPIs se calculan en cada carga de página.

### Evolución futura

| Necesidad | Estrategia |
|-----------|-----------|
| Más de 50 pilotos | Paginación server-side en la tabla |
| KPIs costosos | Materializar en tabla/vista con refresh periódico |
| Más usuarios concurrentes | Supabase Realtime para sincronización |
| Adjuntos/documentos | Supabase Storage |
| Notificaciones | Supabase Edge Functions + webhooks |
| Auditoría detallada | Tabla de audit log con triggers |
