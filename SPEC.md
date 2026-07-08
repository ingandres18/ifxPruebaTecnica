# SPEC — Plataforma de Gestión de VMs (Prueba Técnica IFX)

## 1. Resumen

SPA para gestionar máquinas virtuales con API RESTful de soporte. Frontend protagonista:
estética premium, dark mode, optimistic UI, data visualization y real-time. Backend con
foco en seguridad (JWT en cookie HttpOnly) y autorización por roles.

**Duración objetivo:** 2 días. **Estructura:** monorepo (`/api` + `/web`).

## 2. Stack (decisión cerrada)

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript | Ecosistema maduro, velocidad de dev, tipado end-to-end |
| Estado servidor | TanStack Query v5 | Patrón nativo de optimistic updates con rollback (`onMutate`/`onError`/`onSettled`) |
| Estado cliente | Zustand | Solo preferencias UI (theme). Mínimo y explícito. La sesión (usuario/rol) NO va aquí: es server state y vive en el query de `/auth/me` (ver §9) |
| Router | React Router v6 | Rutas públicas/privadas con guard por autenticación |
| UI | Tailwind CSS + shadcn/ui | Dark mode nativo por clase, componentes accesibles, estética limpia |
| Formularios | react-hook-form + zod | Validación en tiempo real declarativa, schema compartible |
| Charts | Recharts | Requisito explícito de la prueba |
| Toasts | sonner | Feedback de éxito/error |
| Real-time | @microsoft/signalr (cliente) | Par natural del backend .NET |
| Backend | .NET 10 (LTS) Web API + EF Core | LTS vigente (soporte hasta nov. 2028); dominio del stack; SignalR integrado |
| Base de datos | SQLite | Cero setup para el revisor; EF Core migrations + seed |
| Auth | JWT en cookie HttpOnly + Secure + SameSite | Requisito clave de la prueba; nunca en body ni localStorage |
| Real-time server | SignalR (transporte WebSocket) | Cumple "WebSockets o Socket.io"; la cookie viaja en el handshake |
| Docs de API | OpenAPI nativo (`Microsoft.AspNetCore.OpenApi`) + Scalar UI | Documentación viva e interactiva para que el revisor pruebe endpoints sin curl |
| Testing backend | xUnit + WebApplicationFactory (`Mvc.Testing`) | Tests de integración reales contra la API en memoria (cookie, roles, validación) |
| Testing frontend | vitest | Tests unitarios de schemas zod y lógica de cálculo; corre en el mismo toolchain de Vite |

## 3. Modelo de datos

### User
| Campo | Tipo | Reglas |
|---|---|---|
| Id | Guid | PK |
| Email | string | único, formato email |
| PasswordHash | string | BCrypt (nunca texto plano) |
| Role | enum | `Administrador` \| `Cliente` |

### VirtualMachine
| Campo | Tipo | Reglas |
|---|---|---|
| Id | Guid | PK |
| Name | string | 3–50 chars, `^[a-zA-Z][a-zA-Z0-9-]*$` (inicia con letra; letras, números, guiones) |
| Cores | int | 1–64 |
| Ram | int (GB) | 1–512 |
| Disk | int (GB) | 10–4096 |
| Os | enum | `Ubuntu` \| `Debian` \| `Windows Server` \| `RHEL` \| `Otro` |
| Status | enum | `Encendida` \| `Apagada` \| `Suspendida` |
| CreatedAt / UpdatedAt | DateTime UTC | auditoría básica |

### Seed (obligatorio para el revisor)
- `admin@ifx.com` / `Admin123!` → Administrador
- `cliente@ifx.com` / `Cliente123!` → Cliente
- 6–8 VMs de ejemplo con estados variados (para que charts y listado no arranquen vacíos).

## 4. API

Base: `/api`. Todos los endpoints de VMs requieren cookie JWT válida (middleware).
Errores en formato ProblemDetails (RFC 7807). Validación server-side con las mismas reglas del §3
(la validación de UI es UX; la del backend es la real).

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Valida credenciales, setea cookie HttpOnly. Body de respuesta: `{ id, email, role }` — **nunca el token** |
| POST | `/api/auth/logout` | autenticado | Borra la cookie |
| GET | `/api/auth/me` | autenticado | Devuelve usuario actual (rehidratar sesión al recargar la SPA) |
| GET | `/api/vms` | Admin y Cliente | Lista todas las VMs |
| POST | `/api/vms` | **Solo Admin** | Crea VM. 403 si Cliente |
| PUT | `/api/vms/{id}` | **Solo Admin** | Actualiza VM. 403 si Cliente, 404 si no existe |
| DELETE | `/api/vms/{id}` | **Solo Admin** | Elimina VM. 403 si Cliente, 404 si no existe |

### Cookie JWT
- `HttpOnly`, `Secure`, `SameSite=Strict` en producción.
- En desarrollo el frontend consume la API vía **proxy de Vite** (`/api` → `http://localhost:5xxx`),
  de modo que todo es same-origin: sin CORS, `SameSite=Strict` funciona y `Secure` se relaja solo en dev.
- Expiración: 8h. Claims: `sub`, `email`, `role`.

### Idempotencia
- `PUT /vms/{id}` y `DELETE /vms/{id}` deben ser idempotentes por diseño (llamarlos N veces
  con el mismo id produce el mismo estado final; DELETE sobre algo ya borrado → 404, no error).
  
- `POST /vms` NO se implementa con claves de idempotencia (`Idempotency-Key`) — se documenta
  como decisión consciente en §10 (fuera de alcance), no como desconocimiento del patrón.

### Autorización (enforcement real en backend)
- Middleware/atributo `[Authorize(Roles = "Administrador")]` en POST/PUT/DELETE.
- La UI oculta botones por rol, pero eso es cosmético: el backend rechaza con 403 siempre.

### Endurecimiento adicional
- **Rate limiting en `/login`**: middleware nativo de .NET (`AddRateLimiter`), p. ej. 5 intentos/min por IP → 429.
- **Anti-enumeración**: el login responde siempre "credenciales inválidas" (401), nunca revela si el email existe.
- **CSRF**: al usar cookie, el vector CSRF existe (trade-off frente a localStorage, que en cambio es
  vulnerable a XSS). Mitigación: `SameSite=Strict` + arquitectura same-origin vía proxy de Vite.
  Este razonamiento se documenta explícitamente en el README.
- **Secretos**: clave de firma JWT en `appsettings.Development.json` / user-secrets, nunca en el código.
- **Headers de seguridad**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer` vía middleware.
- **Sin fugas de detalle**: errores 500 devuelven ProblemDetails genérico, nunca stack traces.

## 5. SignalR (Real-time)

- Hub `/hubs/vms`. Autenticado por la misma cookie (viaja en el handshake).
- Eventos servidor→cliente: `VmCreated`, `VmUpdated`, `VmDeleted` (payload: la VM o su id).
- Emitidos desde los endpoints tras persistir el cambio.
- Cliente: al recibir evento, actualiza el cache de TanStack Query (`setQueryData`) y marca la
  tarjeta con animación breve (ring/pulse ~1.5s) para resaltar el cambio.
- Reconexión automática (`withAutomaticReconnect`).
- Nota: quien origina la mutación ya actualizó por optimistic UI; el evento debe ser idempotente
  (no duplicar, no re-animar la propia acción — comparar contra un `mutationId` o timestamp).

## 6. Frontend — rutas y comportamiento

La app autenticada usa un **sidebar de navegación** (fijo en desktop, drawer en móvil) que separa
el Dashboard de la gestión de VMs en secciones/rutas distintas (decisión de UX; el listado y los
charts en una sola página se veía saturado — ver §9).

| Ruta | Acceso | Contenido |
|---|---|---|
| `/login` | pública | Form email+password, errores inline, redirige a `/` si ya hay sesión |
| `/` (Dashboard) | privada | Panel de recursos: KPIs + charts (sin listado) |
| `/vms` | privada | Gestión de máquinas virtuales: listado + acciones |
| `/vms/new` | privada **solo Admin** | Formulario de creación |
| `/vms/{id}/edit` | privada **solo Admin** | Formulario de edición |

### Reglas por rol (UI)
- Cliente: los botones/rutas de crear, editar y eliminar **no se renderizan** (no `disabled`, no `hidden` por CSS — no existen en el DOM).
- Admin: ve todo.
- Guard de ruta: si Cliente navega manualmente a `/vms/new` → redirect a `/` con toast informativo.

### Dashboard de recursos
- Suma de Cores, RAM y Disco de las VMs **activas** (Status = Encendida), comparada contra lo
  aprovisionado (todas) vía un indicador de utilización por KPI.
- 4 tarjetas KPI (VMs activas + cores/RAM/disco) + charts Recharts: donut por estado, barras por
  OS y RAM aprovisionada por OS.
- Se recalcula reactivo desde el cache de la query de VMs (sin endpoint extra).

### Optimistic UI (crear / editar / eliminar)
Patrón TanStack Query en cada mutación:
1. `onMutate`: cancelar queries en vuelo, snapshot del cache, aplicar cambio optimista.
2. `onError`: restaurar snapshot + toast de error.
3. `onSuccess`: toast de éxito.
4. `onSettled`: `invalidateQueries` para reconciliar con el servidor.
- En creación optimista usar id temporal (`temp-${crypto.randomUUID()}`) y reemplazarlo al confirmar.

### Feedback visual
- Skeletons (shape de las tarjetas reales) durante carga inicial.
- Empty state ilustrado cuando no hay VMs (con CTA "Crear VM" solo si Admin).
- Toasts para éxito/error de toda mutación.
- Estados de error de red con retry.

### Dark mode
- Nativo con clase `dark` de Tailwind, toggle persistido (Zustand + localStorage — el theme SÍ puede ir en localStorage; el token JAMÁS).
- Respeta `prefers-color-scheme` como valor inicial.

## 7. Estructura de carpetas

```
/api
  /Auth          (endpoints, servicio JWT, cookie options)
  /Vms           (endpoints, DTOs, validadores)
  /Hubs          (VmsHub + notifier)
  /Data          (DbContext, migrations, seed)
  /Common        (ProblemDetails helpers, middleware)
/api.Tests       (xUnit + WebApplicationFactory; espeja las features: /Auth, /Vms)
/web
  /src
    /features
      /auth      (LoginPage, useSession/useLogin/useLogout sobre el query de /auth/me)
      /vms       (list, form, hooks de queries/mutations, tipos)
      /dashboard (KPIs, charts)
    /components/ui   (shadcn)
    /lib         (apiClient, signalr, queryClient, zod schemas)
    /routes      (router, ProtectedRoute, AdminRoute)
```

Tests de frontend (vitest): co-ubicados junto a lo que prueban (`*.test.ts` al lado del schema
zod o de la función de totales), no en una carpeta `/tests` separada.

Organización **feature-based**, no por tipo de archivo: cada feature es autocontenida
(componentes + hooks + tipos juntos).

## 8. Plan de ejecución por slices verticales

El desarrollo se organiza en rebanadas funcionales completas (no por capas técnicas): cada slice
atraviesa backend + frontend, termina en estado demostrable, con sus tests en verde y un commit
que lo referencia (`feat(slice-N): ...`). Criterio de ordenamiento: **riesgo primero** (lo más
incierto al inicio del día) y **dependencias respetadas**.

### Tabla resumen (orden y por qué)

| # | Slice | Justificación del orden |
|---|---|---|
| 0 | Planeación | Gobierna todo lo demás; commit inicial |
| 1 | Scaffolding + harness | El loop de verificación debe existir antes del primer código de negocio. El theme se monta aquí porque retrofitear dark mode es caro |
| 2 | Auth end-to-end | El endurecimiento va aquí, no "para después" |
| 3 | CRUD + listado | Primer valor visible completo; los estados de carga/vacío nacen con el listado |
| 4 | Formulario + Optimistic UI | Requiere el CRUD del slice 3 |
| 5 | Dashboard de recursos | Solo lee datos del slice 3; sin endpoint extra |
| 6 | Real-time (SignalR) | El "plus" diferenciador; requiere mutaciones estables |
| 7 | Cierre | Margen protegido: un README que no funciona invalida todo lo anterior |

Regla de sacrificio si falta tiempo: se recortan primero tests no críticos y animaciones
secundarias; **nunca** el slice 6 (real-time) ni el 7 (README/bitácora).

Ciclo de trabajo dentro de CADA slice (sin excepción): **implementar → Claude Code genera y
corre los tests de ese slice → verificación manual humana siguiendo la lista de abajo → commit**.
No se hace commit sin haber pasado por los tres primeros pasos.

---

### Slice 1 — Scaffolding + harness

**Objetivo:** repo funcional con verificación automática y base visual, sin lógica de negocio.

**Tareas concretas:**
- Backend: proyecto .NET 10 en `/api` (minimal API). Instalar EF Core + proveedor SQLite,
  `Microsoft.AspNetCore.OpenApi` + `Scalar.AspNetCore`. Crear entidades `User` y `VirtualMachine`
  (campos exactos en §3). Migración inicial. Seed: `admin@ifx.com`/`Admin123!`,
  `cliente@ifx.com`/`Cliente123!`, 6–8 VMs de ejemplo con estados variados.
- Frontend: Vite + React + TS en `/web`. Instalar Tailwind, shadcn/ui, TanStack Query, Zustand,
  React Router, react-hook-form, zod, sonner, Recharts, `@microsoft/signalr` y **vitest**.
  Layout base con dark mode (clase `dark` + toggle, aunque las páginas reales lleguen en slices
  siguientes). `vite.config.ts` con proxy `/api` y `/hubs` hacia la API (same-origin, ver §9).
- Testing (el harness nace aquí, aunque vacío): proyecto **`/api.Tests`** (xUnit +
  `Microsoft.AspNetCore.Mvc.Testing` para WebApplicationFactory) referenciando a `/api`,
  con un test trivial de humo para que `dotnet test` corra en verde desde el día cero.
  En `/web`, vitest configurado con un test trivial equivalente.
- Scripts: en `/web`, `npm run verify` (`tsc --noEmit && eslint .`) y `npm run test` (vitest);
  en la raíz de la API, `dotnet build` y `dotnet test` limpios.

**Tests de este slice:** los de humo creados anteriormente (sin lógica de negocio aún). El objetivo es
que `dotnet build`, `dotnet test`, `npm run verify` y `npm run test` corran en verde y la
migración + seed se apliquen sin error — el harness completo funcionando antes del primer
código de negocio.

**Verificación manual humana:** abrir la SPA y ver el layout con el toggle de dark mode
funcionando; abrir Scalar (`/scalar` o la ruta que configure) y confirmar que la API responde.

**Commit:** `chore(slice-1): scaffolding, harness y seed`

---

### Slice 2 — Auth end-to-end

**Objetivo:** login funcional con cookie HttpOnly y endurecimiento de seguridad (§4, "Endurecimiento adicional").

**Tareas concretas:**
- `POST /api/auth/login`: valida contra BCrypt, firma JWT, `Set-Cookie` HttpOnly+Secure+SameSite,
  responde solo `{id, email, role}` (nunca el token). `GET /api/auth/me`. `POST /api/auth/logout`.
- Middleware que lee el JWT desde la cookie y resuelve rol para `[Authorize(Roles=...)]`.
- Rate limiting en `/login` (5/min por IP), mensaje 401 genérico (anti-enumeración),
  headers de seguridad, clave de firma desde configuración.
- Frontend: `LoginPage` con errores inline, session store en Zustand, `ProtectedRoute`,
  llamada a `/auth/me` al montar la app para rehidratar sesión tras un refresh.

**Tests de este slice (de §11):**
- Login correcto → 200, cookie con flag HttpOnly presente, body sin token.
- Login incorrecto → 401 con mensaje genérico.
- Endpoint protegido sin cookie → 401.

**Verificación manual humana:** login con ambos usuarios del seed; en DevTools → Application →
Cookies, confirmar flag `HttpOnly` ✓ y que no hay token en localStorage ni en la respuesta JSON;
recargar la página y confirmar que la sesión persiste; logout y confirmar que expira el acceso.

**Commit:** `feat(slice-2): autenticacion con cookie httponly + endurecimiento`

---

### Slice 3 — CRUD + listado

**Objetivo:** gestión de VMs con autorización real en backend y UI que refleja el rol.

**Tareas concretas:**
- `GET/POST/PUT/DELETE /api/vms` con `[Authorize(Roles="Administrador")]` en mutaciones,
  validación server-side de rangos/formato (§3), ProblemDetails en error.
- Frontend: listado con `useQuery`, skeletons durante carga, empty state si no hay VMs,
  botones de crear/editar/eliminar **ausentes del DOM** (no `disabled`) si el rol es Cliente.

**Tests de este slice (de §11):**
- `POST /vms` con cookie de Cliente → 403; con Admin → 201.
- `POST /vms` con RAM negativa o nombre inválido → 400.
- `DELETE /vms/{id}` sobre algo inexistente → 404; llamado dos veces → segunda 404 (idempotencia).
- `GET /vms` sin cookie → 401; con cualquiera de los dos roles → 200.

**Verificación manual humana:** loguearte como Cliente e inspeccionar el DOM (no solo mirar la
pantalla) para confirmar que los botones de escritura no existen; loguearte como Admin y
confirmar que sí aparecen y funcionan.

**Commit:** `feat(slice-3): crud de vms + listado con roles`

---

### Slice 4 — Formulario + Optimistic UI

**Objetivo:** creación/edición con validación en tiempo real y mutaciones optimistas con rollback.

**Tareas concretas:**
- Rutas `/vms/new` y `/vms/{id}/edit`, `react-hook-form` + `zod`, `mode: "onChange"`.
- `useMutation` con `onMutate` (cancelar queries + snapshot + update optimista), `onError`
  (restaurar snapshot + toast), `onSuccess` (toast), `onSettled` (invalidateQueries).

**Tests de este slice:**
- Test unitario del schema zod: rechaza RAM negativa, rechaza nombre con formato inválido,
  acepta un caso válido.

**Verificación manual humana:** crear una VM y ver que aparece al instante en el listado; **apagar
la API a mitad de una edición** (o simular un error) y confirmar que la UI revierte al estado
anterior con un toast de error — este es el criterio de aceptación central del slice

**Commit:** `feat(slice-4): formulario con validacion en tiempo real + optimistic ui`

---

### Slice 5 — Dashboard de recursos

**Objetivo:** panel con KPIs y gráficos derivados del caché existente, sin endpoint nuevo.

**Tareas concretas:** 3 tarjetas KPI (suma de cores/RAM/disco de VMs con `Status = Encendida`)
+ 2 charts Recharts (distribución por estado y por OS), todo calculado a partir del caché de la
query de VMs del slice 3.

**Tests de este slice:** test unitario de la función que calcula los totales (dado un array de
VMs con estados mixtos, la suma solo cuenta las encendidas).

**Verificación manual humana:** crear/apagar VMs y confirmar que los KPIs se recalculan reactivo,
sin recargar la página.

**Commit:** `feat(slice-5): dashboard de recursos`

---

### Slice 6 — Real-time (SignalR)

**Objetivo:** cambios de estado reflejados al instante en todos los clientes conectados.

**Tareas concretas:**
- Hub `/hubs/vms` autenticado por la cookie existente. Servicio que emite `VmCreated` /
  `VmUpdated` / `VmDeleted` **después** de persistir cada mutación en los endpoints del slice 3.
- Cliente: conexión con `withAutomaticReconnect`; al recibir un evento, `setQueryData` +
  animación breve de resaltado; **debe ignorar el eco de la propia mutación** (comparar contra
  un id de mutación/conexión propio) para no duplicar ni re-animar la acción de quien la originó.

**Tests de este slice:** cobertura automatizada de hubs es cara para 1 día; si el tiempo no
alcanza, se declara explícitamente como verificación manual únicamente.

**Verificación manual humana:** dos navegadores (uno con sesión Admin, otro Cliente en incógnito);
cambiar el estado de una VM desde Admin y confirmar que aparece en el otro navegador con
animación, y que el navegador que originó el cambio NO se duplica ni re-anima.

**Commit:** `feat(slice-6): tiempo real con signalr`

---

### Slice 7 — Cierre

**Objetivo:** el paquete que realmente ve el revisor.

**Tareas concretas:** pulido visual final, README completo (guía de despliegue, credenciales,
decisiones arquitectónicas de §9, diagrama de `ARQUITECTURA.md`), `BITACORA.md` finalizada.

**Tests de este slice:** correr toda la suite completa (backend + frontend) una vez más de punta
a punta.

**Verificación manual humana:** clonar el repo en una carpeta limpia
y seguir tu propio README al pie de la letra, como si fuera el revisor.

**Commit:** `docs(slice-7): readme, bitacora final y pulido`

## 9. Decisiones arquitectónicas y trade-offs (base de la sección del README)

| Decisión | Alternativa descartada | Trade-off asumido |
|---|---|---|
| Monorepo | Repos separados front/back | Menos aislamiento de despliegue; a cambio: un solo README, un clone, historial unificado que evidencia slices verticales |
| Vertical slices en un proyecto | Clean Architecture multi-proyecto | Menos ceremonia de capas; para 1 entidad y 1 día, capas completas serían overengineering. Se migraría a capas si crecieran los dominios |
| SQLite + EF Core | SQL Server / Postgres | Sin concurrencia real de producción; a cambio: cero setup para el revisor |
| Cookie HttpOnly | Token en localStorage | Se asume el vector CSRF (mitigado con SameSite=Strict + same-origin); a cambio se elimina el robo de token por XSS. Requisito de la prueba, con razonamiento propio |
| Proxy de Vite (same-origin en dev) | CORS con credentials | Config extra en vite.config; a cambio: SameSite=Strict funciona sin excepciones y no hay superficie CORS |
| SignalR | Socket.io + Node sidecar | Menos "estándar web agnóstico"; a cambio: integración nativa con auth por cookie y el stack .NET |
| TanStack Query | Redux Toolkit + thunks | Menos control manual del store; a cambio: caché, invalidación y patrón optimista resueltos de fábrica |
| Sin Idempotency-Key en POST | Claves de idempotencia estilo Stripe | Riesgo teórico de doble creación por reintento; fuera de alcance para 1 día, documentado (§10) |
| Sesión como server state en TanStack Query (`/auth/me` como fuente única, hook `useSession`) | Session store espejo en Zustand | Un dato menos que sincronizar manualmente y se respeta la regla "no duplicar server state en Zustand" (CLAUDE.md); a cambio, leer el usuario depende del caché del query en vez de un store dedicado. Zustand queda solo para theme |
| Sidebar con Dashboard y VMs en rutas separadas | Charts + listado juntos en `/` (como decía el SPEC original) | Más superficie de layout (sidebar responsive con drawer móvil); a cambio, cada sección respira, no hay scroll saturado y la app se percibe como un producto real. Ajuste de UX tras ver ambos paneles en una sola página |

## 10. Fuera de alcance (decisión explícita, documentar en README)

- Refresh tokens / rotación (mejora futura), lockout de cuenta tras N intentos fallidos, 2FA.
- Claves de idempotencia (`Idempotency-Key`) en `POST /vms` (ver §9).
- Registro de usuarios (solo seed). Paginación del listado (dataset pequeño; se anota cómo se haría).

## 11. Plan de pruebas (mínimo viable, gate por slice)

Backend (xUnit + WebApplicationFactory):
- `POST /auth/login` correcto → 200, cookie presente con HttpOnly, **el body NO contiene el token**.
- `POST /auth/login` credenciales malas → 401 con mensaje genérico.
- `POST /vms` con cookie de Cliente → 403. Con cookie de Admin → 201.
- `POST /vms` con RAM negativa o nombre inválido → 400 ProblemDetails.
- `DELETE /vms/{id}` dos veces → segunda devuelve 404 (idempotencia observable).

Frontend (vitest):
- Schema zod de VM: rechaza RAM negativa, nombre con formato inválido, acepta caso válido.
- `tsc --noEmit` + ESLint como gate obligatorio de cada slice.

Regla: cada slice define cuáles de estos tests le pertenecen; el slice no se cierra sin ellos en verde
(ver Definition of Done en CLAUDE.md).

## 12. Criterios de aceptación (checklist de cierre)

- [ ] Login setea cookie HttpOnly; el token no aparece en el body ni en localStorage (verificar en DevTools).
- [ ] Recargar la página mantiene la sesión (`/auth/me`).
- [ ] Cliente no ve botones de crear/editar/eliminar en el DOM; curl con cookie de Cliente a POST /vms → 403.
- [ ] Crear/editar/eliminar reflejan al instante; apagar la API a mitad de una mutación → rollback + toast de error.
- [ ] Formulario valida en tiempo real: RAM negativa imposible, nombre con formato inválido marcado al teclear.
- [ ] Panel muestra suma de cores/RAM/disco solo de VMs encendidas y se actualiza al cambiar estados.
- [ ] Con dos navegadores abiertos (admin + cliente), cambiar estado de una VM se refleja en el otro con animación.
- [ ] Skeletons, empty state y dark mode funcionando.
- [ ] `git clone` en carpeta limpia + seguir README ⇒ proyecto corriendo (probado de verdad).
- [ ] README con credenciales, diagrama Mermaid y Bitácora de IA completa.


