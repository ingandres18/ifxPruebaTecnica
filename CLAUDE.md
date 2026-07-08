# CLAUDE.md — Reglas del proyecto (Prueba Técnica IFX: gestión de VMs)

Lee `SPEC.md` antes de cualquier tarea. Es la fuente de verdad de entidades, endpoints,
reglas de rol y estructura. Si una instrucción mía contradice el SPEC, pregúntame antes de asumir.

## Reglas de seguridad — NO NEGOCIABLES

1. El JWT va **exclusivamente** en cookie `HttpOnly` + `Secure` + `SameSite`.
   - NUNCA devolver el token en el body de ninguna respuesta.
   - NUNCA guardar token en localStorage, sessionStorage ni en estado de JS.
   - El frontend no maneja el token: la cookie viaja sola (`credentials` vía proxy same-origin de Vite).
2. La autorización por rol se aplica en el **backend** (`[Authorize(Roles = "Administrador")]`).
   El ocultamiento de botones en la UI es cosmético, nunca el mecanismo de seguridad.
3. Passwords siempre con BCrypt. Nunca comparar en texto plano, nunca loguear credenciales.
4. Validación de inputs en backend con las mismas reglas del SPEC §3, aunque el frontend ya valide.

## Convenciones de código

### Frontend (/web)
- TypeScript estricto. Prohibido `any`; usa `unknown` + narrowing si hace falta.
- Estado de servidor SOLO con TanStack Query. Prohibido copiar datos de queries a useState/Zustand.
- Zustand únicamente para estado de cliente puro (theme). La sesión de usuario (usuario/rol) es
  server state: vive en el query de `/auth/me` como fuente única (hook `useSession`), NO se duplica
  en Zustand. Ver trade-off en SPEC §9.
- Toda mutación de VMs implementa el patrón optimista completo:
  `onMutate` (cancel + snapshot + update) → `onError` (rollback + toast) → `onSettled` (invalidate).
- Formularios con react-hook-form + zod, `mode: "onChange"` para validación en tiempo real.
- Componentes en `/src/features/<feature>/` (feature-based). No crear carpetas genéricas
  tipo `/components/buttons`, `/helpers`, `/utils` sin justificación.
- Renderizado condicional por rol: `{isAdmin && <X/>}`. Prohibido `disabled` o `hidden` para esto.
- Estilos solo con Tailwind + shadcn/ui. Dark mode con la clase `dark`, todos los componentes
  deben verse bien en ambos modos.
- Accesibilidad mínima: labels en inputs, focus visible, botones con texto o aria-label.

### Backend (/api)
- .NET 10 (LTS), **minimal APIs con grupos** (`MapGroup`) — decisión cerrada, no usar controllers.
- Organización por feature (vertical slices) en un solo proyecto. NO generar Clean Architecture
  multi-proyecto ni repositorios genéricos: es decisión documentada del SPEC §9 (trade-offs).
- Clave de firma JWT desde configuración (appsettings.Development.json / user-secrets), nunca hardcodeada.
- DTOs de entrada/salida separados de las entidades EF. Nunca exponer la entidad directamente.
- Errores con ProblemDetails (RFC 7807). No de `return BadRequest("mensaje suelto")`.
- Después de cada mutación exitosa de VM, emitir el evento SignalR correspondiente
  (`VmCreated` / `VmUpdated` / `VmDeleted`).
- Async/await en todo acceso a datos. CancellationToken en los endpoints.

## Loop de verificación y Definition of Done (por slice)

Un slice NO está terminado hasta que se cumpla TODO esto:
1. Frontend: `npm run verify` (`tsc --noEmit && eslint .`) y `npm run test` (vitest) en verde.
2. Backend: `dotnet build` sin warnings nuevos y `dotnet test` en verde.
3. Los tests definidos en SPEC §11 para ese slice existen y pasan.
4. El criterio de aceptación correspondiente del SPEC §12 se cumple manualmente.
5. **`BITACORA.md` actualizada para este slice** (secciones 3 y 4, ver plantilla del archivo).
   Si hubo una línea `DECISIÓN:` tuya en este slice, cópiala ahí antes de continuar.

Si algo falla, corrige e itera. No me reportes una tarea como completa con errores
ni con tests pendientes "para después". No se avanza al siguiente slice con la bitácora
del anterior sin llenar.

## Flujo de trabajo

- Trabajamos por slices verticales (plan y orden en SPEC §8). Una tarea = un slice o parte de uno.
- Para tareas grandes (auth, SignalR, patrón optimista): primero propón un plan corto y espera
  mi aprobación antes de escribir código.
- Commits: mensajes en español, formato `tipo: descripción` (feat/fix/chore/docs).
  Un commit por unidad de trabajo coherente, no un mega-commit al final.
- Si tomas una decisión de diseño no cubierta por el SPEC, declárala explícitamente en tu
  respuesta con el prefijo `DECISIÓN:` para que yo pueda registrarla en BITACORA.md.

## Bitácora

Existe `BITACORA.md` en la raíz. Yo la mantengo, pero cuando te corrija el rumbo o rechace
un enfoque tuyo, resume en una línea qué se corrigió para que yo lo copie ahí.

## Qué NO hacer

- No agregar librerías fuera del stack del SPEC sin preguntar.
- No generar código "por si acaso" (endpoints extra, opciones de config no usadas, abstracciones prematuras).
- No usar datos mock en el frontend una vez exista el endpoint real.
- No tocar `SPEC.md` ni `BITACORA.md` salvo que te lo pida explícitamente.
