# Arquitectura — Modelo C4

> Documentación de arquitectura siguiendo el [modelo C4](https://c4model.com/) (Context,
> Containers, Components), complementada con diagramas de secuencia de los dos flujos críticos
> del sistema. Notación C4 en sintaxis Mermaid para que GitHub los renderice nativamente,
> sin herramientas adicionales para el lector.

---

## Nivel 1 — Contexto del sistema

Quién usa el sistema y con qué propósito. Los dos roles interactúan con la misma plataforma,
pero con capacidades distintas (autorización aplicada en el backend).

```mermaid
C4Context
    title Nivel 1 - Diagrama de Contexto

    Person(admin, "Administrador", "Gestiona el ciclo de vida completo de las VMs: crear, editar, eliminar y cambiar estados")
    Person(cliente, "Cliente", "Consulta el inventario de VMs y el panel de recursos, en modo solo lectura")

    System(plataforma, "Plataforma de Gestión de VMs", "SPA + API RESTful + canal real-time. Permite administrar máquinas virtuales con actualizaciones en vivo para todos los usuarios conectados")

    Rel(admin, plataforma, "Administra VMs y ve el dashboard", "HTTPS")
    Rel(cliente, plataforma, "Consulta VMs y dashboard", "HTTPS")
```

---

## Nivel 2 — Contenedores

Las piezas ejecutables/desplegables del sistema y cómo se comunican. Punto clave de seguridad:
la SPA nunca manipula el token — la cookie `HttpOnly` viaja automáticamente en cada petición
HTTP **y** en el handshake del WebSocket.

```mermaid
C4Container
    title Nivel 2 - Diagrama de Contenedores

    Person(admin, "Administrador")
    Person(cliente, "Cliente")

    System_Boundary(plataforma, "Plataforma de Gestión de VMs") {
        Container(spa, "Single Page Application", "React 19, Vite, TypeScript", "Dark mode. Estado de servidor: TanStack Query (optimistic + rollback), incluida la sesión vía /auth/me. Zustand para preferencias de cliente: theme, sidebar y resaltado real-time")
        Container(api, "API Backend", ".NET 10, ASP.NET Core (Kestrel)", "REST + SignalR en un proceso. JWT vía cookie, autorización por rol, rate limiting, validación server-side")
        ContainerDb(db, "Base de Datos", "SQLite, EF Core", "Usuarios (BCrypt) y VMs. Migraciones + seed de prueba")
    }

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")

    Rel(admin, spa, "Usa", "HTTPS")
    Rel(cliente, spa, "Usa", "HTTPS")
    Rel(spa, api, "Consume API REST", "JSON/HTTPS + cookie HttpOnly")
    Rel(spa, api, "Recibe eventos VM*", "WebSocket (SignalR)")
    Rel(api, db, "Lee y persiste", "EF Core")
```

> **Nota de diseño:** el hub de SignalR corre dentro del mismo proceso que la API (no es un
> contenedor separado). Es deliberado: a esta escala, un servicio real-time independiente
> agregaría latencia de red interna y complejidad operativa sin beneficio. Se separaría si el
> volumen de conexiones concurrentes lo exigiera (ver trade-offs en el README).

---

## Nivel 3 — Componentes de la API

Zoom al contenedor backend: pipeline de middleware, features verticales y el punto exacto
donde nace el evento real-time (después de persistir, nunca antes).

```mermaid
C4Component
    title Nivel 3 - Componentes de la API (.NET 10)

    Container(spa, "Single Page Application", "React", "")
    ContainerDb(db, "SQLite", "EF Core", "")

    Container_Boundary(api, "API Backend") {
        Component(pipeline, "Middleware Pipeline", "ASP.NET Core", "JWT desde cookie: valida firma/expiración, resuelve rol. Rate limiting en /login. Headers de seguridad (nosniff, X-Frame-Options, Referrer-Policy). ProblemDetails global")
        Component(auth, "Feature: Auth", "Minimal API endpoints", "POST /login (BCrypt + Set-Cookie), GET /me, POST /logout. Respuestas anti-enumeración")
        Component(vms, "Feature: VMs", "Minimal API + validadores", "CRUD con [Authorize(Roles)]: mutación solo Admin, lectura Admin y Cliente")
        Component(notifier, "VM Notifier", "Servicio", "Traduce mutaciones persistidas en eventos de dominio")
        Component(hub, "VmsHub", "SignalR Hub", "Broadcast VmCreated/Updated/Deleted, autenticado por cookie")
        Component(data, "Data", "EF Core DbContext", "Entidades, migraciones, seed (admin y cliente demo)")
    }

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")

    Rel(spa, pipeline, "HTTP + cookie", "JSON/HTTPS")
    Rel(pipeline, auth, "Enruta")
    Rel(pipeline, vms, "Enruta (rol resuelto)")
    Rel(auth, data, "Valida credenciales")
    Rel(vms, data, "CRUD")
    Rel(vms, notifier, "Notifica tras persistir")
    Rel(notifier, hub, "Publica evento")
    Rel(hub, spa, "Push a todos los clientes", "WebSocket")
    Rel(data, db, "SQL")
```

---

## Nivel 3 — Componentes de la SPA

Zoom al contenedor de frontend: separación
estricta entre estado de servidor (TanStack Query) y estado de cliente (Zustand), y el guard
de rutas que oculta —no deshabilita— las capacidades según rol.

```mermaid
C4Component
    title Nivel 3 - Componentes de la SPA (React + TypeScript)

    Container(api, "API Backend", ".NET 10", "")

    Container_Boundary(spa, "Single Page Application") {
        Component(router, "Router + Guards + Sidebar", "React Router", "Sidebar (drawer en móvil) separa Dashboard (/) de VMs (/vms). ProtectedRoute exige sesión, AdminRoute exige rol. Cliente no renderiza acciones de escritura")
        Component(authf, "Feature: Auth", "LoginPage + useSession", "Errores inline. Sesión = query de GET /me (fuente única), rehidratada al recargar")
        Component(vmsf, "Feature: VMs", "Listado + Formulario + hooks", "react-hook-form + zod (onChange). Mutaciones optimistas: onMutate/onError/onSettled")
        Component(dash, "Feature: Dashboard", "KPIs + Recharts", "Cores/RAM/disco de VMs activas, derivado del caché de la query")
        Component(rq, "Query Client", "TanStack Query", "Caché de estado de servidor: fuente única para listado y dashboard")
        Component(srclient, "SignalR Client", "@microsoft/signalr", "Actualiza el caché (setQueryData) por evento; el servidor excluye al originador vía connectionId (no recibe su propio eco); reconexión automática")
        Component(ui, "UI Kit", "shadcn/ui + Tailwind", "Dark mode por clase, toasts, componentes accesibles")
    }

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")

    Rel(router, authf, "Monta")
    Rel(router, vmsf, "Monta (según rol)")
    Rel(router, dash, "Monta")
    Rel(vmsf, rq, "useQuery / useMutation")
    Rel(dash, rq, "Lee del caché")
    Rel(srclient, rq, "setQueryData en cada evento")
    Rel(vmsf, ui, "Usa")
    Rel(rq, api, "HTTP + cookie automática", "JSON")
    Rel(srclient, api, "WebSocket", "SignalR")
```

---

## Secuencia 1 — Autenticación con cookie HttpOnly

El token jamás toca JavaScript.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant SPA as SPA (React)
    participant API as API (.NET 10)
    participant DB as SQLite

    U->>SPA: Ingresa email y password
    SPA->>API: POST /api/auth/login {email, password}
    API->>API: Rate limiter (5/min por IP)
    API->>DB: Buscar usuario
    DB-->>API: Usuario + hash
    API->>API: BCrypt.Verify(password, hash)
    alt Credenciales válidas
        API->>API: Firmar JWT (clave desde configuración)
        API-->>SPA: 200 {id, email, role}<br/>Set-Cookie: token (HttpOnly, Secure, SameSite=Strict)
        Note over SPA: El body NO contiene el token.<br/>JS no puede leer la cookie.
        SPA->>SPA: Guardar {usuario, rol} en el caché de TanStack Query (query /auth/me)
        SPA->>U: Redirige al Dashboard
    else Credenciales inválidas o usuario inexistente
        API-->>SPA: 401 "Credenciales inválidas" (mensaje genérico, anti-enumeración)
    end

    Note over SPA,API: Al recargar la página:
    SPA->>API: GET /api/auth/me (cookie viaja sola)
    API-->>SPA: 200 {id, email, role} → sesión rehidratada
```

---

## Secuencia 2 — Mutación con Optimistic UI + broadcast real-time

Rollback ante fallo y actualización instantánea en los demás clientes conectados.

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin (navegador 1)
    participant Q1 as TanStack Query (nav. 1)
    participant API as API (.NET 10)
    participant DB as SQLite
    participant HUB as VmsHub (SignalR)
    participant Q2 as TanStack Query (nav. 2)
    actor C as Cliente (navegador 2)

    A->>Q1: Cambia estado de VM (Apagada → Encendida)
    Q1->>Q1: onMutate: cancelar queries, snapshot del caché,<br/>aplicar cambio optimista
    Note over A: La UI refleja el cambio<br/>INMEDIATAMENTE
    Q1->>API: PUT /api/vms/{id}<br/>(cookie + header X-Connection-Id)
    API->>API: Middleware: rol = Administrador ✓
    API->>DB: Persistir cambio

    alt Éxito
        DB-->>API: OK
        API->>HUB: Publicar VmUpdated (tras persistir)<br/>a todos EXCEPTO la conexión originadora
        API-->>Q1: 200
        Q1->>Q1: onSettled: invalidateQueries (reconciliar)
        Note over Q1: El originador NO recibe el evento<br/>(su conexión fue excluida): no duplica ni re-anima
        HUB-->>Q2: VmUpdated {vm}
        Q2->>Q2: setQueryData (Q2 no es el originador)
        Q2->>C: Tarjeta actualizada con animación de resaltado
    else Falla (red caída / 4xx / 5xx)
        API-->>Q1: Error
        Q1->>Q1: onError: restaurar snapshot (ROLLBACK)
        Q1->>A: Toast de error + UI revertida
        Note over HUB: No se emite evento:<br/>nada se persistió
    end
```

---

## Cómo leer esta documentación

| Diagrama | Pregunta que responde |
|---|---|
| Contexto (C4-1) | ¿Quién usa el sistema y para qué? |
| Contenedores (C4-2) | ¿Qué piezas ejecutables existen y por qué canales se hablan? |
| Componentes API (C4-3) | ¿Dónde se aplica la seguridad y dónde nace el evento real-time? |
| Componentes SPA (C4-3) | ¿Cómo se separa estado de servidor/cliente y cómo se ocultan capacidades por rol? |
| Secuencia auth | ¿Por qué el token nunca toca JavaScript? |
| Secuencia optimistic + real-time | ¿Qué pasa exactamente al mutar, al fallar, y en los demás clientes? |
