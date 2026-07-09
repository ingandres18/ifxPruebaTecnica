# IFX · Plataforma de Gestión de VMs

SPA para gestionar máquinas virtuales con API RESTful de soporte. Frontend protagonista
(estética premium, dark mode, optimistic UI, dashboard y real-time) y backend con foco en
seguridad (JWT en cookie `HttpOnly`) y autorización por roles.

> Monorepo: **`/api`** (.NET 10) + **`/web`** (React 19 + Vite). Documentación de arquitectura
> en [`ARQUITECTURA.md`](ARQUITECTURA.md) y bitácora de uso de IA en [`BITACORA.md`](BITACORA.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · Vite · TypeScript (estricto) · TailwindCSS · shadcn/ui |
| Estado servidor | TanStack Query v5 (optimistic updates + rollback) |
| Estado cliente | Zustand (solo theme y preferencias de UI) |
| Formularios | react-hook-form + Zod |
| Charts | Recharts |
| Real-time | `@microsoft/signalr` (WebSocket) |
| Backend | .NET 10 · ASP.NET Core minimal APIs · EF Core |
| Base de datos | SQLite (migraciones + seed automáticos) |
| Auth | JWT en cookie `HttpOnly` + `Secure` + `SameSite=Strict` |
| Docs de API | OpenAPI + Scalar UI |
| Tests | xUnit + WebApplicationFactory (backend) · Vitest (frontend) |

---

## Requisitos previos

- **.NET SDK 10** — https://dotnet.microsoft.com/download
- **Node.js 20+** (probado con 22 LTS) — https://nodejs.org

Verifica: `dotnet --version` (10.x) y `node --version` (20+).

---

## Cómo ejecutar

Necesitas **dos terminales**. No requiere configurar secretos: la clave JWT de desarrollo vive
en `api/appsettings.Development.json` y la base de datos SQLite se **crea y siembra sola** al
arrancar la API.

### 1. Backend (API)

```bash
cd api
dotnet run
```

Al ver `Now listening on: http://localhost:5141` está lista. En el primer arranque se aplican las
migraciones y se siembran los datos de prueba (`api/ifxvms.db`).

- API: http://localhost:5141
- **Documentación interactiva (Scalar):** http://localhost:5141/scalar

### 2. Frontend (SPA)

```bash
cd web
npm install
npm run dev
```

Abre **http://localhost:5173**. El dev server de Vite hace *proxy* de `/api` y `/hubs` hacia la
API (arquitectura same-origin: la cookie viaja sola, sin CORS).

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@ifx.com` | `Admin123!` |
| Cliente | `cliente@ifx.com` | `Cliente123!` |

El Administrador puede crear/editar/eliminar VMs; el Cliente es de solo lectura.

---

## Qué probar

- **Cookie `HttpOnly`** — inicia sesión y en *DevTools → Application → Cookies* verifica que
  `ifx_auth` tiene el flag `HttpOnly ✓`. En *Local Storage* solo hay `ifx-theme` (nunca el token);
  en la consola, `document.cookie` sale vacío. El token **jamás** toca JavaScript.
- **Sesión persistente** — recarga la página: sigues autenticado (rehidratación vía `/auth/me`).
- **Autorización por rol** — como Cliente, inspecciona el DOM: los botones de crear/editar/eliminar
  **no existen** (no están ocultos por CSS). Un `POST /api/vms` con cookie de Cliente responde `403`.
- **Optimistic UI + rollback** — crea/edita una VM y observa el cambio al instante. Detén la API a
  mitad de una edición: la UI **revierte** al estado anterior con un toast de error.
- **Validación en tiempo real** — en el formulario, RAM negativa o nombre con formato inválido se
  marcan al teclear.
- **Dashboard reactivo** — cambia el estado de una VM y mira cómo los KPIs y gráficos se recalculan
  sin recargar.
- **Filtro y búsqueda** — en *Máquinas virtuales*, filtra por estado o busca por nombre.
- **Real-time (SignalR)** — abre **dos navegadores** (uno normal como Admin, otro en incógnito como
  Cliente). Cambia una VM desde Admin: en el otro navegador aparece al instante con un resaltado, y
  el navegador que originó el cambio **no se duplica ni re-anima** (su conexión se excluye del broadcast).
- **Resiliencia ante errores de render** — la app está envuelta en un `ErrorBoundary`
  (`web/src/components/error-boundary.tsx`): un error de renderizado en cualquier componente muestra
  una pantalla de recuperación ("Algo salió mal" + recargar) en vez de tumbar toda la SPA en blanco.

---

## Seguridad

- **JWT solo en cookie `HttpOnly` + `Secure` + `SameSite=Strict`.** Nunca en el body de la respuesta
  ni en `localStorage`. El frontend no maneja el token.
- **Trade-off cookie vs `localStorage`:** la cookie asume el vector **CSRF**, mitigado con
  `SameSite=Strict` + arquitectura *same-origin* (proxy de Vite); a cambio, se elimina el robo de
  token por **XSS** (que sí afecta a `localStorage`).
- **Autorización real en el backend** con `[Authorize(Roles = "Administrador")]`. Ocultar botones en
  la UI es cosmético, no el mecanismo de seguridad.
- **Endurecimiento:** rate limiting en `/login` (5/min por IP → 429), respuestas anti-enumeración
  (401 genérico + defensa de *timing* con hash señuelo), headers de seguridad
  (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`), passwords con BCrypt,
  errores como ProblemDetails (sin stack traces), clave JWT desde configuración.

---

## Arquitectura y decisiones

Diagramas C4 (contexto, contenedores, componentes) y de secuencia (auth y optimistic + real-time)
en [`ARQUITECTURA.md`](ARQUITECTURA.md), renderizados con Mermaid.

Decisiones y trade-offs destacados:

| Decisión | Trade-off asumido |
|---|---|
| Monorepo | Menos aislamiento de despliegue; a cambio, un solo clone y un historial que evidencia slices verticales |
| Vertical slices en un proyecto (no Clean Architecture) | Menos ceremonia de capas; para 1 entidad y 1 día, capas completas serían overengineering |
| SQLite | Sin concurrencia de producción; a cambio, cero setup para el revisor |
| Cookie `HttpOnly` | Se asume CSRF (mitigado); a cambio, se elimina el robo por XSS |
| SignalR | Menos "estándar web agnóstico"; a cambio, auth por cookie nativa y stack .NET unificado |
| Sesión como server state (TanStack Query) | Se lee el usuario del caché de `/auth/me` en vez de duplicarlo en Zustand |
| Sidebar con Dashboard y VMs separados | Más layout; a cambio, cada sección respira y se percibe como producto real |

### Fuera de alcance (decisión consciente)

Refresh tokens / rotación, lockout de cuenta, 2FA, claves de idempotencia (`Idempotency-Key`) en
`POST`, registro de usuarios (solo seed) y paginación del listado (dataset pequeño).

---

## Tests

```bash
# Backend (desde la raíz)
dotnet test

# Frontend (desde /web)
npm run verify   # tsc --noEmit + ESLint (gate de tipos y lint)
npm run test     # Vitest
```

- **Backend (integración, xUnit + WebApplicationFactory):** login con cookie `HttpOnly` y body sin
  token, 401 genérico, `403`/`201` por rol en `POST /vms`, `400` de validación, idempotencia del
  `DELETE` (404 en el segundo intento).
- **Frontend (Vitest):** schema Zod de VM y funciones puras del dashboard (los totales solo cuentan
  las VMs encendidas).
- **Real-time (SignalR):** la cobertura automatizada de hubs es costosa para el alcance de 1 día, así
  que se declara explícitamente como **verificación manual** (dos navegadores, ver *Qué probar*).

---

## Estructura del proyecto

```
/api                 API .NET 10 (minimal APIs, vertical slices)
  /Auth              login/logout/me, JWT desde cookie, DTOs
  /Vms               CRUD, validación, DTOs, notifier de eventos
  /Hubs              VmsHub (SignalR)
  /Data              DbContext, migraciones, seed
  /Common            headers de seguridad
/api.Tests           xUnit + WebApplicationFactory
/web                 SPA React 19 + Vite
  /src
    /features        auth · vms · dashboard (feature-based)
    /routes          router, guards (ProtectedRoute/AdminRoute), sidebar, layout
    /lib             apiClient, signalr, queryClient
    /stores          theme, ui, highlight (Zustand)
    /components      brand, theme-toggle, error-boundary (ver "Qué probar")
    /components/ui    shadcn/ui
ARQUITECTURA.md      diagramas C4 + secuencias (Mermaid)
BITACORA.md          bitácora de uso de IA
SPEC.md              especificación funcional (fuente de verdad)
```
